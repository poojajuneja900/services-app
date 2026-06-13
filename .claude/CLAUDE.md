# SERVICE-APP — Claude Project Memory

## Project Overview
A Java Spring Boot REST API service. This file is read automatically by Claude Code at the start of every session to provide project context.

## Tech Stack
- **Language**: Java 26
- **Framework**: Spring Boot 3.5.0
- **Build Tool**: Maven (`pom.xml`)
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA / Hibernate
- **API Style**: RESTful JSON API

## Project Structure
```
SERVICE-APP/
├── .claude/                    # Claude Code configuration & memory
│   ├── CLAUDE.md               # This file — project context for Claude
│   └── settings.json           # Claude Code settings
├── src/
│   ├── main/
│   │   ├── java/com/example/serviceapp/
│   │   │   ├── controller/     # REST controllers (@RestController)
│   │   │   ├── service/        # Business logic (@Service)
│   │   │   ├── repository/     # Data access (@Repository)
│   │   │   ├── model/          # JPA entities / domain models
│   │   │   ├── dto/            # Request/Response DTOs
│   │   │   ├── exception/      # Custom exceptions & global handler
│   │   │   └── ServiceAppApplication.java
│   │   └── resources/
│   │       ├── application.yml # Main config
│   │       └── application-dev.yml
│   └── test/
│       └── java/com/example/serviceapp/
├── pom.xml                     # Maven build descriptor
├── .env                        # Local secrets (git-ignored)
├── .env.example                # Example env vars (committed)
└── .gitignore
```

## Common Commands

### Build & Run
```bash
# Build (skip tests)
mvn clean package -DskipTests

# Run locally
mvn spring-boot:run

# Run with a specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Testing
```bash
# Run all tests
mvn test

# Run a specific test class
mvn test -Dtest=UserControllerTest
```

### Gradle (if using Gradle instead of Maven)
```bash
./gradlew bootRun
./gradlew test
./gradlew bootJar
```

## Key Dependencies (Spring Boot Starters)
- `spring-boot-starter-web` — REST API
- `spring-boot-starter-data-jpa` — ORM / database access
- `spring-boot-starter-validation` — Bean Validation (JSR-380)
- `spring-boot-starter-test` — JUnit 5 + Mockito
- `spring-boot-starter-security` — (add when auth is needed)
- `lombok` — Reduce boilerplate

## Conventions
- Controllers are thin — delegate all logic to `@Service` classes
- Use DTOs for request/response; never expose JPA entities directly
- Use `@ControllerAdvice` + `@ExceptionHandler` for global error handling
- Return standard HTTP status codes (`201 Created`, `404 Not Found`, etc.)
- Configuration via `application.yml`; secrets via environment variables only
- All endpoints prefixed with `/api/v1/`

## Environment Variables
Copy `.env.example` to `.env` and fill in values. Reference in `application.yml` with `${VAR_NAME}`. Never hard-code secrets.

## Notes
<!-- Add project-specific notes, gotchas, and decisions here as the project grows -->
