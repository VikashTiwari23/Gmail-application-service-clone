package com.example.GEmailReceiver.controller;

import com.example.GEmailReceiver.DTO.GEmailSender;
import com.example.GEmailReceiver.Entity.Email;
import com.example.GEmailReceiver.service.GEmailService;
import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@Slf4j
public class EmailReceiverController {

    @Autowired
    private GEmailService emailService;

    @Autowired
    private FeignEmailSender feignEmailSender;

    @GetMapping("/inbox")
    public ResponseEntity<List<Email>> getInbox() {
        return ResponseEntity.ok(emailService.getEmails(GEmailService.INBOX));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<Email>> getSent() {
        return ResponseEntity.ok(emailService.getEmails(GEmailService.SENT));
    }

    @GetMapping("/draft")
    public ResponseEntity<List<Email>> getDraft() {
        return ResponseEntity.ok(emailService.getEmails(GEmailService.DRAFTS));
    }

    @GetMapping("/trash")
    public ResponseEntity<List<Email>> getTrash() {
        return ResponseEntity.ok(emailService.getEmails(GEmailService.TRASH));
    }

    @PostMapping("/sendEmail")
    public ResponseEntity<Map<String, Object>> sendEmail(
            @RequestBody GEmailSender sender) {
        try {
            String response = feignEmailSender.sendEmail(sender);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", response));
        } catch (FeignException e) {
            log.error("Email sender service call failed for {}", sender, e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "success", false,
                            "error", "Email service unavailable"));
        } catch (Exception e) {
            log.error("Unexpected error sending email", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "error", "Unexpected error"));
        }
    }
}
