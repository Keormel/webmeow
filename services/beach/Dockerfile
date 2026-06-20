# ── Build stage ──
FROM gradle:8-jdk21-alpine AS builder
WORKDIR /app
COPY . .
RUN gradle buildFatJar --no-daemon

# ── Runtime stage ──
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*-all.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
