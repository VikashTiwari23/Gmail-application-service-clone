package com.example.JavaEmailSender.cotroller;

import com.example.JavaEmailSender.entity.GEmailSender;
import com.example.JavaEmailSender.service.GEmailSenderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
public class EmailController {

    @Autowired
    GEmailSenderService emailSenderService;


    @PostMapping("/sendmail")
    public String sendMail(@RequestBody GEmailSender emailSender){
        emailSenderService.sendEmail(emailSender);
        return "Email Sent";
    }
}

