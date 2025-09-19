# ===== Build =====
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .
# nos aseguramos de que el wrapper tenga permisos
RUN chmod +x mvnw
RUN ./mvnw -DskipTests package

# ===== Run =====
FROM eclipse-temurin:17-jre
WORKDIR /app
# copia el jar que se genera en target/
COPY --from=build /app/target/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
CMD ["java","-Dserver.port=${PORT}","-jar","/app/app.jar"]
