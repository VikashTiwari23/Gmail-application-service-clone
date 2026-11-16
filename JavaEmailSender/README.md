# Full-Stack Microservices Gmail Client

A containerized, microservices-based Gmail web application built with **Spring Boot**, **Spring Cloud OpenFeign**, **React (TypeScript)**, **Tailwind CSS**, and **Docker Compose**. It connects directly to Gmail servers via **IMAPS** for real-time folder synchronization and **SMTPS** for outgoing mail dispatch.

## Architecture

```mermaid
flowchart LR
    User(["Browser / User"])

    subgraph Docker["Docker Compose Bridge Network"]
        FE["email-frontend\nReact + TypeScript + Nginx\nPort: 5173"]
        RX["GEmailReceiver\nSpring Boot + Jakarta Mail\nPort: 8082"]
        TX["JavaEmailSender\nSpring Boot + JavaMailSender\nPort: 8080"]
    end

    Gmail[("Gmail Servers\nimap.gmail.com:993\nsmtp.gmail.com:587")]

    User <-->|"HTTP :5173"| FE
    FE <-->|"REST API (/api/email/*)"| RX
    RX -->|"POST /sendEmail\nSpring Cloud OpenFeign"| TX
    RX <-->|"IMAPS (Port 993)\nInbox / Sent / Drafts / Trash"| Gmail
    TX -->|"SMTPS (Port 587)\nSend Outgoing Mail"| Gmail