# ===== Build stage =====
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .
# Ensure wrapper is executable (Windows repos may lose +x)
RUN if [ -f mvnw ]; then chmod +x mvnw; fi &&     ./mvnw -DskipTests package

# ===== Runtime stage =====
FROM eclipse-temurin:17-jre
WORKDIR /app
# Copy the fat jar produced by Spring Boot
COPY --from=build /app/target/*.jar app.jar
# Render sets $PORT; pass it to Spring
ENV PORT=8080
EXPOSE 8080
CMD ["java","-Dserver.port=${PORT}","-jar","/app/app.jar"]
