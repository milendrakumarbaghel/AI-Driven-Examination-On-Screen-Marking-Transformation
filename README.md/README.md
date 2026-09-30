# AI-Driven Examination & On-Screen Marking Transformation

> **Built for MPOnline Idea & Innovation Hackathon 2026**  
> **Core Principle:** *AI Assists. Examiner Decides.*  
> An AI-assisted university examination evaluation and digital on-screen marking platform designed to make evaluation faster, more consistent, transparent, and auditable while keeping human examiners in complete control of university marks.

---

## 🏛️ Executive Summary

University examinations have traditionally relied on manual, physical answer sheet distribution, resulting in slow turnaround times, evaluation fatigue, and inconsistent marking across examiners.

**E-Valuate AI** transforms this paradigm by introducing:
1. **Document Digitization & OCR**: Intelligent OpenCV preprocessing (grayscale, bilateral denoising, Otsu binarization, deskewing) and OCR extraction with question-wise segmentation.
2. **Pedagogical AI Evaluation**: Evaluates extracted answers using question-specific model answers, structured rubrics, concept extraction, and LLM reasoning (Gemini / OpenAI with deterministic offline fallback).
3. **Explainable AI (XAI)**: Explicitly surfaces **Matched Concepts** (✓) and **Missing Concepts** (✗) alongside concise pedagogical explanations and confidence indicators.
4. **On-Screen Marking (OSM) Workspace**: Split-screen workbench pairing the original document viewer with real-time AI suggestions, allowing examiners to accept, tweak, or override marks with a single click.
5. **Quality Control & Moderation**: Automated detection of unanswered/empty questions, low-confidence OCR/AI evaluations, and large AI-vs-Examiner mark discrepancies (&ge; 3.0 marks).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TailwindCSS v4, React Router 7, Axios, Lucide Icons, Recharts |
| **Backend** | Java 25 / 21, Spring Boot 3 / 4, Spring Security, JWT (HMAC-SHA512), Spring Data JPA, Hibernate, Jakarta Validation, Maven Wrapper |
| **AI Service** | Python 3.12, FastAPI, OpenCV, PyTesseract, PyPDF, Pydantic v2, Uvicorn, Google Gemini / OpenAI REST abstractions |
| **Database** | PostgreSQL (Cloud-hosted NeonDB configured by default; H2 fallback supported) |
| **File Storage** | Clean local filesystem storage (`uploads/answer-sheets/{examId}/`) with path traversal guards |

---

## 👥 Demo User Credentials

The platform includes seed data with pre-configured accounts:

| Role | Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | `admin123` | Exam setup, question & rubric authoring, executive analytics dashboard |
| **EXAMINER** | `examiner@example.com` | `examiner123` | Answer sheet upload, split-screen on-screen marking, mark approval & override |
| **MODERATOR** | `moderator@example.com` | `moderator123` | Inspect low-confidence evaluations, mark variance alerts, formal sign-off |

> **Tip:** The Login page includes **1-Click Demo Buttons** (`[Admin]`, `[Examiner]`, `[Moderator]`) for fast, zero-typing hackathon presentations!

---

## 🚀 Quick Start / How to Run Locally

### 1. Prerequisites
- **Java**: JDK 21 or later (`java -version`)
- **Node.js**: v20 or later (`node -v`, `npm -v`)
- **Python**: 3.10 to 3.12 (`python3 --version`)
- **Tesseract OCR** (optional, fallback OCR active):
  - macOS: `brew install tesseract`
  - Ubuntu/Debian: `sudo apt-get install tesseract-ocr`
  - Windows: [UB-Mannheim Tesseract installer](https://github.com/UB-Mannheim/tesseract/wiki)

---

### 2. Run the AI Service (Python FastAPI)

```bash
cd ai-service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS / Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/ai/health`

---

### 3. Run the Backend Service (Spring Boot)

```bash
cd backend

# Run with Maven Wrapper (all dependencies download automatically)
# macOS / Linux:
./mvnw spring-boot:run
# Windows:
# mvnw.cmd spring-boot:run
```
- Server runs on: `http://localhost:8080`
- Database: Pre-connected to cloud NeonDB PostgreSQL.
- Seeding: Automatically seeds demo users, the *CS301 Java Programming* examination with 5 questions & rubrics, and candidate answer sheets on first run.

---

### 4. Run the Frontend (React + Vite)

```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
- Open in Browser: `http://localhost:5173`

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
- **No Secret Leakage**: Zero API keys hardcoded in frontend source code.

---

## 🏆 Innovation & Hackathon Impact (MPOnline 2026)

1. **Pedagogical Alignment, Not Just Keyword Matching**: AI evaluates semantic understanding and rubric criteria, allowing students who phrase concepts accurately in their own words to receive fair marks.
2. **Explainable AI (XAI)**: Eliminates the "black box" of automated grading. Examiners instantly see *why* a score was suggested through matched concepts, missing items, and rationale.
3. **Fail-Safe Resilience**: If OCR encounters unusual handwriting or the external LLM is offline, examiners can directly edit extracted text and assign marks manually without any system deadlock.
