# === Etapa de build ===
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .
# Compila y empaqueta (omite tests para rapidez)
RUN ./mvnw -DskipTests package

# === Etapa de runtime ===
FROM eclipse-temurin:17-jre
WORKDIR /app
# Copia el .jar resultante (ajusta el patrón si tu JAR tiene nombre fijo)
COPY --from=build /app/target/*.jar app.jar
# Fly inyecta $PORT — Spring lo usará
ENV PORT=8080
EXPOSE 8080
CMD ["java","-Dserver.port=${PORT}","-jar","/app/app.jar"]
