# Render-ready bundle for Spring Boot (Maven)

This zip contains minimal files so your existing **Spring Boot + Maven (mvnw)** project
deploys on **Render** reliably using Docker.

## What's inside
- `Dockerfile` — multi-stage build (JDK 17) compiling with `./mvnw package` and running the jar.
- `render.yaml` — tells Render to deploy using Docker (plan: free) and health-check `/`.
- `.dockerignore` — keeps images small (ignores `target/`, `.git/`, etc.).

## How to use
1. **Unzip** these files **into the root of your Spring Boot repo** (same folder as `pom.xml`).
2. Commit and push:
   ```bash
   git add Dockerfile render.yaml .dockerignore
   git commit -m "chore: render-ready deployment (docker)"
   git push
   ```
3. In **Render**:
   - New → **Web Service** → **Build & deploy from a Git repository**.
   - Select your repo. Render will read `render.yaml` and use the `Dockerfile`.
   - Region/Name: as you like. Plan: **Free**.
   - Click **Create Web Service**.

Render will build the image (stage 1), then run the app (stage 2).  
The service listens on port `$PORT` which Render injects; Spring uses it via `-Dserver.port=${PORT}`.

## Notes / Tips
- Requires JDK 17. The Dockerfile already uses Temurin 17.
- If your jar has **a fixed name** and Render fails to find it, replace `*.jar` with your exact jar name in the Dockerfile.
- If your project lives in a **subfolder** of a mono-repo, either:
  - Move these files into that subfolder, **or**
  - Set `rootDir: <subfolder>` in `render.yaml`.

## Environment variables
If you need a database or secrets, set them in **Render → Environment**:
- Examples:
  - `SPRING_DATASOURCE_URL`
  - `SPRING_DATASOURCE_USERNAME`
  - `SPRING_DATASOURCE_PASSWORD`

Then click **Redeploy**.

## Health check
By default `render.yaml` checks `/`. If you use Actuator, you can change to `/actuator/health`:
```yaml
healthCheckPath: /actuator/health
```
