# Render-ready (no mvnw) for Spring Boot + Maven

Use this when your repo **doesn't include `mvnw`**. It relies on the official Maven image.

## Dockerfile Highlights
- `FROM maven:3.9.8-eclipse-temurin-17` for build (has `mvn` preinstalled).
- Caches dependencies by copying `pom.xml` first and running `dependency:go-offline`.
- Copies `src/` and runs `mvn -DskipTests package`.
- Runtime uses `eclipse-temurin:17-jre` and runs `app.jar` on `$PORT`.

## Steps
1. Put these files at the **same level as `pom.xml`**.
2. Commit & push.
3. Create a Render Web Service from your repo.

If your project is in a **subfolder**, move these files into that folder or set `rootDir` in `render.yaml`.

## Multi-module projects
If your jar is generated inside a submodule, adjust the copy step:
```
COPY --from=build /app/<submodule>/target/*.jar app.jar
```
or build with:
```
RUN mvn -pl <module-artifactId> -am -DskipTests package
```
