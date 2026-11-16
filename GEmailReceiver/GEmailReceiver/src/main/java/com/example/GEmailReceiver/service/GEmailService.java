package com.example.GEmailReceiver.service;

import com.example.GEmailReceiver.Entity.Email;
import jakarta.mail.Address;
import jakarta.mail.BodyPart;
import jakarta.mail.FetchProfile;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.Store;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMultipart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GEmailService {

    private static final Logger log = LoggerFactory.getLogger(GEmailService.class);

    public static final String INBOX = "INBOX";
    public static final String SENT = "[Gmail]/Sent Mail";
    public static final String DRAFTS = "[Gmail]/Drafts";
    public static final String TRASH = "[Gmail]/Trash";

    private static final List<String> FOLDERS = List.of(INBOX, SENT, DRAFTS, TRASH);
    private static final int MAX_EMAILS = 50;
    private static final int MAX_CONTENT_CHARS = 300;
    private static final long CACHE_TTL_MS = 60_000;

    @Value("${spring.mail.host:imap.gmail.com}")
    private String host;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    private final Map<String, List<Email>> emailCache = new ConcurrentHashMap<>();
    private final Map<String, Long> lastFetched = new ConcurrentHashMap<>();
    private final Set<String> loadingFolders = ConcurrentHashMap.newKeySet();

    @EventListener(ApplicationReadyEvent.class)
    public void warmUpCache() {
        for (String folderName : FOLDERS) {
            Thread thread = new Thread(() -> fetchEmails(folderName), threadName(folderName));
            thread.setDaemon(true);
            thread.start();
        }
    }

    @Scheduled(fixedRate = 60000)
    public void refreshInbox() {
        fetchEmails(INBOX);
    }

    public List<Email> getEmails(String folderName) {
        List<Email> cached = emailCache.get(folderName);
        long fetchedAt = lastFetched.getOrDefault(folderName, 0L);
        boolean stale = System.currentTimeMillis() - fetchedAt > CACHE_TTL_MS;

        if ((cached == null || stale) && !loadingFolders.contains(folderName)) {
            fetchEmails(folderName);
            cached = emailCache.get(folderName);
        }
        return cached != null ? cached : Collections.emptyList();
    }

    private String threadName(String folderName) {
        return "gmail-fetch-" + folderName.replaceAll("[^a-zA-Z]", "").toLowerCase();
    }

    private void fetchEmails(String folderName) {
        if (!loadingFolders.add(folderName)) {
            return;
        }

        Store store = null;
        Folder folder = null;
        List<Email> emails = new ArrayList<>();
        try {
            Session session = Session.getInstance(imapProps());
            store = session.getStore("imap");
            store.connect(host, username, password);

            folder = store.getFolder(folderName);
            folder.open(Folder.READ_ONLY);

            int total = folder.getMessageCount();
            if (total == 0) {
                emailCache.put(folderName, Collections.emptyList());
                lastFetched.put(folderName, System.currentTimeMillis());
                log.info("No emails found in {}", folderName);
                return;
            }

            int start = Math.max(1, total - MAX_EMAILS + 1);
            Message[] messages = folder.getMessages(start, total);

            FetchProfile fetchProfile = new FetchProfile();
            fetchProfile.add(FetchProfile.Item.ENVELOPE);
            fetchProfile.add(FetchProfile.Item.CONTENT_INFO);
            folder.fetch(messages, fetchProfile);

            for (Message message : messages) {
                emails.add(toEmail(message));
            }
            Collections.reverse(emails);

            emailCache.put(folderName, List.copyOf(emails));
            lastFetched.put(folderName, System.currentTimeMillis());
            log.info("Loaded latest {} emails from {}", emails.size(), folderName);
        } catch (Exception e) {
            log.error("Failed to fetch emails from folder {}", folderName, e);
        } finally {
            closeQuietly(folder, store);
            loadingFolders.remove(folderName);
        }
    }

    private Email toEmail(Message message) {
        Email email = new Email();
        try {
            email.setFrom(message.getFrom() != null ? InternetAddress.toString(message.getFrom()) : "");
            Address[] recipients = message.getRecipients(Message.RecipientType.TO);
            email.setTo(recipients != null ? InternetAddress.toString(recipients) : "");
            email.setSubject(message.getSubject());
            Date date = message.getReceivedDate() != null ? message.getReceivedDate() : message.getSentDate();
            email.setReceivedDate(date);
            email.setContent(truncate(getTextFromMessage(message)));
        } catch (Exception e) {
            log.warn("Failed to read message: {}", e.getMessage());
        }
        return email;
    }

    private Properties imapProps() {
        Properties props = new Properties();
        props.put("mail.store.protocol", "imap");
        props.put("mail.imap.host", host);
        props.put("mail.imap.port", "993");
        props.put("mail.imap.ssl.enable", "true");
        props.put("mail.imap.connectiontimeout", "10000");
        props.put("mail.imap.timeout", "30000");
        return props;
    }

    private String truncate(String content) {
        if (content == null) {
            return "";
        }
        String flattened = content.replaceAll("\\s+", " ").trim();
        if (flattened.length() > MAX_CONTENT_CHARS) {
            return flattened.substring(0, MAX_CONTENT_CHARS) + "...";
        }
        return flattened;
    }

    private void closeQuietly(Folder folder, Store store) {
        try {
            if (folder != null && folder.isOpen()) {
                folder.close(false);
            }
        } catch (Exception e) {
            log.warn("Failed to close folder: {}", e.getMessage());
        }
        try {
            if (store != null && store.isConnected()) {
                store.close();
            }
        } catch (Exception e) {
            log.warn("Failed to close store: {}", e.getMessage());
        }
    }

    private String getTextFromMessage(Message message) throws Exception {
        Object content = message.getContent();
        if (message.isMimeType("text/plain") && content instanceof String) {
            return (String) content;
        }
        if (message.isMimeType("multipart/*") && content instanceof MimeMultipart mimeMultipart) {
            String text = getTextFromMimeMultipart(mimeMultipart);
            if (text != null && !text.isEmpty()) {
                return text;
            }
        }
        if (content instanceof MimeMultipart mimeMultipart) {
            String text = getTextFromMimeMultipart(mimeMultipart);
            if (text != null && !text.isEmpty()) {
                return text;
            }
        }
        if (content instanceof String stringContent) {
            return stringContent;
        }
        return "";
    }

    private String getTextFromMimeMultipart(MimeMultipart mimeMultipart) throws Exception {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < mimeMultipart.getCount(); i++) {
            BodyPart bodyPart = mimeMultipart.getBodyPart(i);
            if (bodyPart.isMimeType("text/plain")) {
                sb.append(bodyPart.getContent());
            }
        }
        return sb.toString();
    }
}
