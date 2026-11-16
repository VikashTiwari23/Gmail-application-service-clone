FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
ARG CONTAINER_PORT=8080

COPY target/*.jar app.jar
EXPOSE ${CONTAINER_PORT}
ENTRYPOINT ["java", "-jar", "app.jar"]
