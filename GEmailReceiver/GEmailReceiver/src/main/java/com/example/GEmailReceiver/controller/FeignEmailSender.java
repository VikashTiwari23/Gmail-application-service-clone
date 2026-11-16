package com.example.GEmailReceiver.controller;

import com.example.GEmailReceiver.DTO.GEmailSender;
import com.example.GEmailReceiver.Entity.Email;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name="email-sender-service",url = "http://localhost:8080")
public interface FeignEmailSender {

    @PostMapping("/sendmail")
    String sendEmail(@RequestBody GEmailSender email);
}
