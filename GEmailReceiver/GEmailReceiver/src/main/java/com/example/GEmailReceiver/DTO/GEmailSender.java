package com.example.GEmailReceiver.DTO;

import lombok.Data;

import java.util.Date;

@Data
public class GEmailSender {
    private String to;
    private String subject;
    private String message;
}
