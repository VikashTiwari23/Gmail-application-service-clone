package com.example.JavaEmailSender.service;

import com.example.JavaEmailSender.entity.GEmailSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class GEmailSenderService {

    @Autowired
    JavaMailSender javaMailSender;

    public void sendEmail(GEmailSender emailSender) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailSender.getTo());
        message.setSubject(emailSender.getSubject());
        message.setText(emailSender.getMessage());
        javaMailSender.send(message);
    }
}
