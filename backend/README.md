# ☕ E-Valuate AI — Backend REST API Engine

> **Core Backend Service for the MPOnline Idea & Innovation Hackathon 2026**  
> Enterprise-grade, clean, and modular Spring Boot 3/4 REST API with Spring Security, JWT authentication, Spring Data JPA, Hibernate, PostgreSQL, and FastAPI AI orchestration.

---

## 📖 Overview

The **Backend Service** serves as the central orchestration engine for the E-Valuate AI examination evaluation platform. Following strict enterprise layered architecture (`Controller -> Service -> Repository -> Entity`), it manages:

1. **Authentication & Authorization**: Role-Based Access Control (RBAC) supporting `ADMIN`, `EXAMINER`, `MODERATOR`, and `STUDENT` roles with stateless HMAC-SHA512 JWT tokens.
2. **Academic & Examination Management**: CRUD lifecycle for academic subjects, university examinations, questions, model answers, and multi-criteria marking rubrics.
3. **Answer Sheet Ingestion & File Handling**: Multipart upload validation for PDF and image answer sheets with local disk storage, path traversal protection, and UUID deduplication.
4. **AI Processing Pipeline Orchestration**: Communicates with the FastAPI AI microservice for OCR extraction, question segmentation, and rubric evaluation.
5. **Human-in-the-Loop Evaluation Engine**: Enforces strict mark bounds (`0 <= marks <= maxMarks`), saves examiner overrides, and logs an immutable audit trail.
6. **Quality Control & Moderation Rules**: Automatically flags evaluations for senior moderator review based on:
   - **Low Confidence**: AI confidence score below configured threshold (`< 70%`).
   - **Mark Discrepancy**: Difference between AI suggestion and examiner mark &ge; configured threshold (`>= 3.0` marks).
   - **Unanswered / Empty**: Extracted answer consists of negligible text.
7. **Executive Analytics**: Generates real-time aggregation metrics for dashboard charts, question difficulty analysis, and candidate marksheet certification.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Language** | Java 21 or Java 25 (LTS) |
| **Framework** | Spring Boot 3.x / 4.x |
| **Web & Validation** | Spring Web MVC, Jakarta Validation (`@Valid`, `@NotNull`, `@Min`) |
| **Security** | Spring Security 7, JJWT (`jjwt-api:0.12.6`), BCrypt password hashing |
| **Persistence** | Spring Data JPA, Hibernate 6, PostgreSQL Dialect |
| **Database** | PostgreSQL (Pre-configured cloud NeonDB; in-memory H2 profile supported) |
| **Build Tool** | Apache Maven with Maven Wrapper (`./mvnw`, `mvnw.cmd`) |
| **Testing** | JUnit 5, Mockito, Spring Boot Test |

---

## 📂 Project Structure

```text
backend/
├── src/
│   ├── main/
│   │   ├── java/org/springboot/backend/
│   │   │   ├── config/              # RestTemplateConfig, DataInitializer (demo seed data)
│   │   │   ├── controller/          # REST API endpoints (Auth, Exam, Subject, Question, AnswerSheet, Moderation, Dashboard, File)
│   │   │   ├── dto/                 # Request & Response Data Transfer Objects
│   │   │   │   ├── ai/              # Payloads for communication with FastAPI AI service
│   │   │   │   ├── auth/            # LoginRequest, AuthResponse, UserDto
│   │   │   │   ├── dashboard/       # DashboardStatsDto, QuestionStats, ChartPoint
│   │   │   │   ├── evaluation/      # AnswerSheetResponse, EvaluationDto, ModerationFlagDto, ResultSummaryDto
│   │   │   │   └── exam/            # ExamRequest, ExamResponse, QuestionRequest, RubricDto, SubjectDto
│   │   │   ├── entity/              # JPA domain entities (User, Exam, Question, Rubric, AnswerSheet, Answer, Evaluation, ModerationFlag)
│   │   │   │   └── enums/           # Role, ExamStatus, ProcessingStatus, EvaluationStatus, ModerationFlagType, Severity
│   │   │   ├── exception/           # GlobalExceptionHandler, ResourceNotFoundException, BadRequestException
│   │   │   ├── repository/          # Spring Data JPA repositories with custom JPQL queries
│   │   │   ├── security/            # SecurityConfig, JwtUtil, JwtAuthenticationFilter, CustomUserDetailsService
│   │   │   ├── service/             # Business logic layer (Auth, Exam, Question, AnswerSheet, AiProcessing, Storage, Moderation, Dashboard)
│   │   │   └── BackendApplication.java # Spring Boot main entrypoint
│   │   └── resources/
│   │       ├── application.properties # Default configuration (Cloud PostgreSQL NeonDB, JWT, AI Service URL)
│   │       └── application-dev.yml    # Development profile (optional H2 in-memory settings)
│   └── test/java/org/springboot/backend/
│       └── service/
│           └── AnswerSheetServiceTest.java # Unit tests for mark override, bounds validation, and moderation variance flags
├── mvnw                             # Maven wrapper executable (macOS / Linux)
├── mvnw.cmd                         # Maven wrapper executable (Windows)
├── pom.xml                          # Maven build dependencies and plugins
└── uploads/                         # Runtime local file storage (ignored in Git)
```

---

## ⚙️ Prerequisites

- **Java Development Kit (JDK)**: JDK 21 or later (`java -version`)
- **Maven**: Bundled via `./mvnw` / `mvnw.cmd` (no separate Maven installation required!)
- **PostgreSQL**: Pre-connected to high-performance cloud NeonDB instance; zero local database installation required for standard demo!

---

## 🚀 Step-by-Step Setup & Run Guide

### 1. Configuration Check

Open [`backend/src/main/resources/application.properties`](file:///Users/milendrakumarbaghel/Documents/Idea%20&%20Innovate%20Hackathon/AI-Driven-Examination-On-Screen-Marking-Transformation/backend/src/main/resources/application.properties):

```properties
# Server
server.port=8080

# Cloud PostgreSQL Database (NeonDB)
spring.datasource.url=jdbc:postgresql://ep-long-darkness-axpis0uo.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require
spring.datasource.username=neondb_owner
spring.datasource.password=npg_z07iVvOqQtkH
spring.jpa.hibernate.ddl-auto=update

# AI Microservice URL
ai.service.url=http://localhost:8000

# File Upload Location
app.upload.dir=uploads/answer-sheets

# Quality Control Thresholds
evaluation.variance.threshold=3.0
evaluation.confidence.threshold=0.70
```

> **Note:** The cloud database is active and ready out of the box. If you wish to use a local PostgreSQL instance instead, simply update `spring.datasource.url`, `username`, and `password`.

---

### 2. Operating System-Specific Run Commands

#### 🍎 macOS
```bash
cd backend

# Give execution permission to Maven wrapper (if needed)
chmod +x mvnw

# Run Spring Boot Application
./mvnw spring-boot:run
```
> Server starts on: **`http://localhost:8080`**

---

#### 🪟 Windows (Command Prompt or PowerShell)
```cmd
cd backend

REM Run Spring Boot Application using Windows Maven wrapper
mvnw.cmd spring-boot:run
```
> If using PowerShell:
> ```powershell
> .\mvnw.cmd spring-boot:run
> ```
> Server starts on: **`http://localhost:8080`**

---

#### 🐧 Linux (Ubuntu / Debian / CentOS / Fedora)
```bash
cd backend

# Ensure execute permissions
chmod +x mvnw

# Run Spring Boot Application
./mvnw spring-boot:run
```
> Server starts on: **`http://localhost:8080`**

---

## 🧪 Automated Seed Data & Credentials

When the backend starts up, [`DataInitializer.java`](file:///Users/milendrakumarbaghel/Documents/Idea%20&%20Innovate%20Hackathon/AI-Driven-Examination-On-Screen-Marking-Transformation/backend/src/main/java/org/springboot/backend/config/DataInitializer.java) automatically initializes:

1. **Pre-configured User Accounts** (passwords hashed using BCrypt):
   - **Admin**: `admin@example.com` / `admin123`
   - **Examiner**: `examiner@example.com` / `examiner123`
   - **Moderator**: `moderator@example.com` / `moderator123`
2. **Subject**: `CS301 - Java Programming`
3. **Exam**: `B.Tech Semester V Final Examination 2026`
4. **5 Detailed Questions & Rubrics**:
   - Q1: Java Inheritance & Code Reusability (10 Marks)
   - Q2: Exception Handling Architecture & Hierarchy (10 Marks)
   - Q3: Polymorphism (Compile-time vs Runtime) (10 Marks)
   - Q4: Abstract Classes vs Interfaces (10 Marks)
   - Q5: JVM Memory Architecture (Heap, Stack, Metaspace, GC) (10 Marks)
5. **Sample Evaluated Candidate**: `MP-2026-CS-1042` with an active `LOW_CONFIDENCE` moderation flag on Q5 for live demonstration.

---

## 📡 REST API Reference

All protected endpoints require the HTTP header:  
`Authorization: Bearer <JWT_ACCESS_TOKEN>`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user credentials and returns JWT token + user details |
| `GET` | `/api/auth/me` | Authenticated | Returns current authenticated user profile |

### 2. Subjects & Exams (`/api/subjects`, `/api/exams`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/subjects` | Authenticated | Lists all academic subjects |
| `POST` | `/api/subjects` | Admin | Creates a new academic subject |
| `GET` | `/api/exams` | Authenticated | Lists all examinations with question & sheet counts |
| `POST` | `/api/exams` | Admin | Creates a new examination |
| `GET` | `/api/exams/{id}` | Authenticated | Retrieves detailed exam info including questions and rubrics |
| `POST` | `/api/exams/{id}/questions`| Admin | Adds a question with model answer and scoring rubric |

### 3. Answer Sheets & On-Screen Marking (`/api/answer-sheets`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/answer-sheets/upload` | Examiner / Admin | Uploads scanned PDF/image answer sheet (`multipart/form-data`) |
| `GET` | `/api/answer-sheets/{id}` | Authenticated | Retrieves answer sheet details, extracted answers, and AI evaluations |
| `GET` | `/api/answer-sheets/exam/{examId}` | Authenticated | Lists all candidate answer sheets for an exam |
| `POST` | `/api/answer-sheets/{id}/process-ocr` | Examiner / Admin | Triggers OCR extraction and question segmentation via AI service |
| `POST` | `/api/answer-sheets/{id}/evaluate-ai` | Examiner / Admin | Triggers pedagogical AI evaluation against marking rubrics |
| `PUT` | `/api/answer-sheets/evaluations/{evalId}` | Examiner / Admin | Saves human examiner approved marks and feedback comment |
| `POST` | `/api/answer-sheets/evaluations/{evalId}/flag` | Examiner / Admin | Manually flags an evaluation for senior moderator inspection |
| `POST` | `/api/answer-sheets/{id}/finalize` | Examiner / Admin | Finalizes sheet evaluation, calculates total score, and issues certificate |
| `GET` | `/api/answer-sheets/{id}/summary` | Authenticated | Retrieves certified marksheet summary, grade, and audit record |

### 4. Quality Control & Moderation (`/api/moderation`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/moderation/flags` | Moderator / Admin | Lists all pending or resolved moderation flags with candidate info |
| `POST` | `/api/moderation/flags/{flagId}/resolve` | Moderator / Admin | Resolves flag with moderator decision and audit rationale |

### 5. Dashboards & Analytics (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Admin / Examiner / Moderator | Aggregated KPIs: total sheets, evaluated count, pending, low confidence count |
| `GET` | `/api/dashboard/charts` | Admin / Moderator | Recharts datasets: Progress chart, Question averages, AI-vs-Examiner discrepancy, Difficulty rating |

### 6. Local File Serving (`/api/files`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/files/download/**` | Authenticated | Safely streams original scanned answer sheet PDF/image to browser viewer |

---

## 🧪 Running Unit Tests

Critical evaluation business logic, mark range constraints, and variance flag generation are validated via JUnit 5 and Mockito:

```bash
# macOS / Linux
./mvnw test -Dtest=AnswerSheetServiceTest

# Windows
mvnw.cmd test -Dtest=AnswerSheetServiceTest
```

Test suite validates:
- Mark bounds enforcement (`0 <= marks <= maxMarks`).
- Automatic generation of `AI_EXAMINER_VARIANCE` moderation flag when examiner mark deviates &ge; 3.0 points from AI suggestion.
- Successful examiner mark persistence and status transitions.

---

## ❓ Troubleshooting & FAQs

- **Issue: Port 8080 is in use**
  - Kill the existing process:
    - macOS/Linux: `lsof -ti :8080 | xargs kill -9`
    - Windows: `netstat -ano | findstr :8080` and `taskkill /PID <PID> /F`
  - Or change the port in `application.properties`: `server.port=8081` (update `VITE_API_BASE_URL` in frontend accordingly).
- **Issue: Cannot connect to AI service**
  - Ensure the Python FastAPI service is running on `http://localhost:8000`.
  - The backend safely catches AI connection timeouts and permits manual examiner marking without system crash.
- **Issue: Java version mismatch**
  - Ensure `java -version` returns 21 or later. If multiple JDKs are installed, set `JAVA_HOME`:
    - macOS: `export JAVA_HOME=$(/usr/libexec/java_home -v 21)`
    - Windows: `set JAVA_HOME=C:\Program Files\Java\jdk-21`
