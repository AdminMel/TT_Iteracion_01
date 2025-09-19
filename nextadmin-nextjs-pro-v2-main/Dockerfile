# ===== Build stage (uses Maven image, no mvnw needed) =====
FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom first to cache dependencies
COPY pom.xml ./
RUN mvn -B -DskipTests dependency:go-offline

# Copy sources
COPY src ./src

# Package application
RUN mvn -B -DskipTests package

# ===== Runtime stage =====
FROM eclipse-temurin:17-jre
WORKDIR /app

# If your build creates a specific jar, replace *.jar with exact name
COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080
CMD ["java","-Dserver.port=${PORT}","-jar","/app/app.jar"]
