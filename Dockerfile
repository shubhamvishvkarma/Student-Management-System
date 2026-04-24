# Build stage
FROM gradle:8.5-jdk21 AS builder
WORKDIR /app
COPY . .
RUN gradle build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /app/build/libs/demo-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
