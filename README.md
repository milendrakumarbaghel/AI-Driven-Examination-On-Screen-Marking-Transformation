# 🎓 AI-Driven Examination & On-Screen Marking Transformation
### Project Name: **E-Valuate AI**

> **Built for MPOnline Idea & Innovation Hackathon 2026**  
> **Core Principle:** *AI Assists. Examiner Decides.*  
> An AI-assisted university examination evaluation and digital on-screen marking platform designed to make evaluation faster, more consistent, transparent, and auditable while keeping human examiners in complete control of university marks.

---

## 📚 Module Documentation Links

For deep dives into individual sub-systems, setup instructions, and architecture:
- 🖥️ **Frontend Web Application (React 19 + Vite + TailwindCSS)** &rarr; [`frontend/README.md`](frontend/README.md)
- ☕ **Backend REST API Engine (Spring Boot 3/4 + Java + PostgreSQL)** &rarr; [`backend/README.md`](backend/README.md)
- 🧠 **AI & OCR Microservice (FastAPI + OpenCV + Tesseract + LLMs)** &rarr; [`ai-service/README.md`](ai-service/README.md)
- 📄 **Sample Test Answer Sheets (PDFs & Scanned Images)** &rarr; [`sample-data/README.md`](sample-data/README.md)

---

## 🏛️ Executive Summary

University examinations have traditionally relied on manual, physical answer sheet distribution, resulting in slow turnaround times, evaluation fatigue, high administrative costs, and inconsistent marking across examiners.

**E-Valuate AI** transforms this paradigm by introducing:
1. **Document Digitization & OCR**: Intelligent OpenCV preprocessing (grayscale, bilateral denoising, Otsu binarization, deskewing) and OCR extraction with question-wise segmentation.
2. **Pedagogical AI Evaluation**: Evaluates extracted answers using question-specific model answers, structured rubrics, concept extraction, and LLM reasoning (Gemini / OpenAI with deterministic offline fallback).
3. **Explainable AI (XAI)**: Explicitly surfaces **Matched Concepts** (✓) and **Missing Concepts** (✗) alongside concise pedagogical explanations and confidence indicators.
4. **On-Screen Marking (OSM) Workspace**: Split-screen workbench pairing the original document viewer with real-time AI suggestions, allowing examiners to accept, tweak, or override marks with a single click.
5. **Quality Control & Moderation**: Automated detection of unanswered/empty questions, low-confidence OCR/AI evaluations, and large AI-vs-Examiner mark discrepancies (&ge; 3.0 marks).
6. **Executive Analytics**: Real-time Recharts dashboards tracking evaluation throughput, question averages, and difficulty indices.

---

## 🏗️ System Architecture & Workflow

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      React 19 + Vite Frontend                          │
 │  - Split-screen On-Screen Marking UI (PDF/Image Zoom + Rubric Panel)   │
 │  - Admin, Examiner, and Moderator Role-Guarded Dashboards               │
 │  - Recharts Visual Analytics & Certified Result Marksheet Export       │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP (REST + JWT Bearer)
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                  Spring Boot 3/4 Backend Core (Java)                   │
 │  - Spring Security 7 + HMAC-SHA512 JWT Authentication                  │
 │  - Business Logic & Mark Override Bounds Enforcement (0 <= M <= Max)   │
 │  - Quality Control Moderation Engine (<70% conf, >=3.0 mark variance)  │
 │  - Spring Data JPA / Hibernate Persistence                             │
 └─────────────────┬─────────────────────────────────┬────────────────────┘
                   │                                 │
                   ▼ (Multipart & JSON REST)         ▼ (JPA / JDBC)
 ┌───────────────────────────────────┐    ┌───────────────────────────────┐
 │    FastAPI AI & OCR Microservice  │    │      PostgreSQL Database      │
 │  - OpenCV Preprocessing (Deskew)  │    │  - Cloud NeonDB Configured    │
 │  - PyTesseract / PyPDF OCR        │    │  - Users, Exams, Questions,   │
 │  - Q1..Qn Regex Segmentation      │    │    Rubrics, Answer Sheets,    │
 │  - LLM Evaluation (Gemini/OpenAI) │    │    Evaluations, Mod Flags     │
 │  - Offline Deterministic Mock     │    └───────────────────────────────┘
 └─────────────────┬─────────────────┘
                   │
                   ▼ HTTPS (REST)
 ┌───────────────────────────────────┐
 │   LLM Providers (Cloud / Mock)    │
 │  - Google Gemini (gemini-2.5-flash)
 │  - OpenAI (gpt-4o-mini)           │
 │  - Deterministic Mock Provider    │
 └───────────────────────────────────┘
```

### End-to-End Data Flow:
```text
Examiner uploads scan (PDF/Image)
       │
       ▼
Spring Boot saves file to local disk (`uploads/answer-sheets/{examId}/`)
       │
       ▼
Spring Boot triggers AI service (`POST /ai/ocr`)
       │
       ▼
FastAPI preprocesses image, extracts text, and segments into questions (Q1..Qn)
       │
       ▼
Spring Boot triggers evaluation (`POST /ai/evaluate`) with Question, Model Answer & Rubric
       │
       ▼
LLM evaluates answer & returns: Suggested Marks, Confidence, Matched/Missing Concepts, Explanation
       │
       ▼
Examiner reviews on split-screen UI: Accepts mark OR inputs custom mark override
       │
       ▼
Spring Boot saves final examiner mark & checks moderation rules (flags if variance >= 3.0)
       │
       ▼
Examiner finalizes sheet -> Generates certified marksheet certificate -> Admin views analytics
```

---

## 🛠️ Technology Stack Summary

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TailwindCSS v4, React Router 7, Axios, Lucide Icons, Recharts |
| **Backend** | Java 21 / 25, Spring Boot 3.x / 4.x, Spring Security, JWT (HMAC-SHA512), Spring Data JPA, Hibernate, Jakarta Validation, Maven Wrapper |
| **AI Service** | Python 3.10 - 3.12, FastAPI, OpenCV, PyTesseract, PyPDF, Pydantic v2, Uvicorn, Google Gemini / OpenAI REST abstractions |
| **Database** | PostgreSQL (Pre-connected cloud NeonDB; in-memory H2 profile supported) |
| **Storage** | Local disk file-system storage (`uploads/answer-sheets/{examId}/`) with path traversal guards |

---

## 👥 Demo User Credentials

The platform includes seed data with pre-configured accounts:

| Role | Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | `admin123` | Exam setup, question & rubric authoring, executive analytics dashboard |
| **EXAMINER** | `examiner@example.com` | `examiner123` | Answer sheet upload, split-screen on-screen marking, mark approval & override |
| **MODERATOR** | `moderator@example.com` | `moderator123` | Inspect low-confidence evaluations, mark variance alerts, formal sign-off |

> **Presentation Tip:** The Login page includes **1-Click Demo Buttons** (`[Admin]`, `[Examiner]`, `[Moderator]`) for fast, zero-typing hackathon presentations!

---

## 🚀 Quick Start / How to Run Locally

You will need **3 terminal windows** open simultaneously (one for each service).

### Prerequisites Check
- **Java**: JDK 21 or later (`java -version`)
- **Node.js**: v18 or later (`node -v`, `npm -v`)
- **Python**: 3.10 to 3.12 (`python3 --version` or `py --version`)
- **Tesseract OCR** (for physical image OCR):
  - macOS: `brew install tesseract`
  - Linux: `sudo apt install tesseract-ocr`
  - Windows: [UB-Mannheim installer](https://github.com/UB-Mannheim/tesseract/wiki)

---

### Terminal 1: Run AI Service (Port 8000)

```bash
cd ai-service

# Setup virtual environment
# macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# Windows (Command Prompt):
# python -m venv venv
# venv\Scripts\activate.bat

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API Health Check: `http://localhost:8000/ai/health`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

### Terminal 2: Run Backend Service (Port 8080)

```bash
cd backend

# macOS / Linux:
chmod +x mvnw
./mvnw spring-boot:run

# Windows (Command Prompt):
# mvnw.cmd spring-boot:run
```
- Server runs on: `http://localhost:8080`
- Database: Pre-connected to cloud NeonDB PostgreSQL.
- Seeding: Automatically seeds demo users, the *CS301 Java Programming* exam with 5 questions & rubrics, and candidate answer sheets on initial run.

---

### Terminal 3: Run Frontend Web App (Port 5173)

```bash
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```
- Open in Browser: **`http://localhost:5173`**

---

## 🔑 Multi-OS Terminal Cheat Sheet

| Action | macOS / Linux | Windows (CMD / PowerShell) |
| :--- | :--- | :--- |
| **AI venv activate** | `source venv/bin/activate` | `venv\Scripts\activate.bat` or `.\venv\Scripts\Activate.ps1` |
| **AI run** | `uvicorn app.main:app --reload --port 8000` | `uvicorn app.main:app --reload --port 8000` |
| **Backend run** | `./mvnw spring-boot:run` | `mvnw.cmd spring-boot:run` |
| **Frontend run** | `npm run dev` | `npm run dev` |
| **Kill port 8080** | `lsof -ti :8080 \| xargs kill -9` | `netstat -ano \| findstr :8080` &rarr; `taskkill /PID <PID> /F` |
| **Kill port 8000** | `lsof -ti :8000 \| xargs kill -9` | `netstat -ano \| findstr :8000` &rarr; `taskkill /PID <PID> /F` |
| **Kill port 5173** | `lsof -ti :5173 \| xargs kill -9` | `netstat -ano \| findstr :5173` &rarr; `taskkill /PID <PID> /F` |

---

## 🤖 Configuring API Keys (Gemini & OpenAI)

Open [`ai-service/.env`](ai-service/.env):

```env
# Free Google Gemini API Key from https://aistudio.google.com/
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
OPENAI_API_KEY=
AI_PROVIDER=GEMINI
AI_MOCK_MODE=false
PORT=8000
```

> **Hackathon Presentation Safety:**  
> If demonstrating without internet access or during API maintenance, toggle `AI_MOCK_MODE=true` in `ai-service/.env`. The AI service will use its built-in deterministic rubric evaluator, ensuring 100% presentation uptime and zero lag during your presentation.

---

## 📋 Comprehensive Acceptance Criteria Verification

| ID | Requirement / Acceptance Criteria | Status | Details |
| :---: | :--- | :---: | :--- |
| **1** | Login as Admin | ✅ Complete | Secure JWT login, redirected to Admin Dashboard. |
| **2** | Create/Open Exam with Questions & Rubrics | ✅ Complete | Subject CS301 created with 5 descriptive questions, model answers, and multi-criteria rubrics. |
| **3** | Login as Examiner | ✅ Complete | Examiner role authentication with workspace navigation. |
| **4** | Upload Scanned Answer Sheet | ✅ Complete | Multipart upload supporting PDF, PNG, JPG under `uploads/answer-sheets/{examId}/`. |
| **5** | Answer Sheet Document Viewer | ✅ Complete | Dual-mode viewer (Original Document + Raw Text view) with zoom and pop-out support. |
| **6** | Trigger OCR Processing | ✅ Complete | OpenCV image preprocessing (denoise, threshold, deskew) + PyTesseract / PDF extraction. |
| **7** | Extracted Answer Text Question-wise | ✅ Complete | Automatic Q1..Qn segmentation with fallback editable text editor. |
| **8** | Trigger AI Evaluation | ✅ Complete | Sends question, max marks, model answer, rubric, and student text to evaluation engine. |
| **9** | Suggested Marks, Confidence, Concepts, Explanation | ✅ Complete | Strict JSON response with matched concepts (✓), missing concepts (✗), and rationale. |
| **10** | Manual Mark Override | ✅ Complete | Clear distinction between AI Suggested and Final Examiner Marks with increment/decrement controls. |
| **11** | Save Examiner-Approved Marks | ✅ Complete | Persisted into PostgreSQL with examiner comments and status update. |
| **12** | Finalize Answer Sheet | ✅ Complete | Atomic finalization with score aggregation and audit timestamp. |
| **13** | Result Summary Card | ✅ Complete | Certificate marksheet view with breakdown, grade, percentage, and print stylesheet. |
| **14** | Admin Dashboard Analytics | ✅ Complete | Interactive Recharts visualizations: Progress Donut, Performance Bar, Variance Line, Difficulty. |
| **15** | Quality Control & Low Confidence Flags | ✅ Complete | Triggers moderation flags on low confidence (&lt;70%) and large mark discrepancy (&ge;3.0). |

---

## 🔒 Security & Data Integrity Highlights

- **BCrypt Password Hashing**: Zero plaintext passwords stored in the database.
- **Stateless JWT Authentication**: Signed with HMAC-SHA512 with 24-hour expiration.
- **Path Traversal Protection**: Uploaded file names sanitized with UUID prefixes and directory traversal detection.
- **Server-Side Range Validation**: Examiner marks strictly bounded by `0 <= mark <= question.maxMarks`.
- **Role-Based Authorization**: Endpoints guarded via Spring Security `@PreAuthorize("hasRole(...)")`.
- **Zero Secret Leakage**: Zero API keys hardcoded in frontend source code.

---

## 🏆 Innovation & Hackathon Impact (MPOnline 2026)

1. **Pedagogical Alignment, Not Just Keyword Matching**: AI evaluates semantic understanding and rubric criteria, allowing students who phrase concepts accurately in their own words to receive fair marks.
2. **Explainable AI (XAI)**: Eliminates the "black box" of automated grading. Examiners instantly see *why* a score was suggested through matched concepts, missing items, and rationale.
3. **Fail-Safe Resilience**: If OCR encounters unusual handwriting or the external LLM is offline, examiners can directly edit extracted text and assign marks manually without any system deadlock.
4. **Complete Human Examiner Sovereignty**: AI only assists—the human examiner always decides the legal, finalized university mark.
