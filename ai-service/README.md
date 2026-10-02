# 🧠 E-Valuate AI — AI & OCR Microservice

> **AI Intelligence Engine for the MPOnline Idea & Innovation Hackathon 2026**  
> High-performance FastAPI service delivering OpenCV computer vision preprocessing, multi-format OCR document extraction, intelligent question segmentation, and Explainable AI (XAI) rubric evaluation with multi-provider LLM support (Google Gemini, OpenAI, and deterministic offline mock).

---

## 📖 Overview

The **AI Service** handles all computer vision, document parsing, and natural language understanding tasks for the examination platform. Built with Python 3 and FastAPI, it performs:

1. **Document Ingestion & Image Preprocessing**:
   - Supports multi-page PDFs, high-resolution scans (`.png`, `.jpg`, `.jpeg`, `.tiff`), and text files.
   - Image enhancement pipeline via OpenCV: grayscale conversion, bilateral / Gaussian blur denoising, Otsu adaptive binarization, and automated skew angle detection and correction.
2. **Multi-Engine OCR Extraction**:
   - Extracts handwritten and printed text using **PyTesseract** and digital text from PDF streams using **PyPDF**.
3. **Question Segmentation**:
   - Automatically parses OCR output and segments responses question-by-question using pattern matchers (`Q1`, `Q.1`, `1.`, `1)`, `Question 1`, `Ans 1`).
4. **Pedagogical Rubric Evaluation**:
   - Evaluates each student's response against the question statement, maximum marks, model answer, and marking criteria.
   - Rewards conceptual understanding and valid alternative phrasing rather than rigid word-for-word memorization.
5. **Explainable AI (XAI) Outputs**:
   - Returns a structured JSON payload identifying **Matched Concepts** (✓), **Missing Concepts** (✗), a confidence metric (`0.0 - 1.0`), suggested marks (strictly bounded to `0 <= suggested <= maxMarks`), and a concise explanation.
6. **Multi-Provider LLM Abstraction with Hackathon Safety**:
   - Pluggable provider architecture supporting **Google Gemini** (`gemini-2.5-flash`), **OpenAI** (`gpt-4o-mini`), and a **Deterministic Offline Mock Provider** ensuring 100% presentation uptime even in offline or rate-limited environments.

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | FastAPI | High-speed, async Python web API with automated OpenAPI docs |
| **Server** | Uvicorn | Lightweight ASGI production-ready server |
| **Validation** | Pydantic v2 | Strict schema validation and JSON serialization |
| **Computer Vision** | OpenCV (`opencv-python-headless`) | Denoising, binarization, thresholding, deskewing |
| **OCR Engines** | PyTesseract & Tesseract OCR | Optical Character Recognition on scanned images |
| **PDF Extraction**| PyPDF | Native digital text extraction and stream parsing from PDFs |
| **LLM Providers** | Google Gemini & OpenAI | Generative AI reasoning against pedagogical rubrics |
| **Networking** | Requests | Direct REST HTTP client (zero heavy proprietary SDK bloat) |

---

## 📂 Project Structure

```text
ai-service/
├── app/
│   ├── api/
│   │   └── routes.py              # FastAPI REST endpoints (/ai/ocr, /ai/evaluate, /ai/health)
│   ├── models/
│   │   └── schemas.py             # Pydantic v2 schemas for requests & responses
│   ├── prompts/
│   │   └── evaluation_prompt.py   # Pedagogical system & user prompts for structured evaluation
│   ├── services/
│   │   ├── evaluation_service.py  # Evaluation pipeline coordinator & score bounder
│   │   ├── llm_provider.py        # LLM abstraction (Gemini, OpenAI, Mock provider)
│   │   └── ocr_service.py         # Multi-format document parser & text extractor
│   ├── utils/
│   │   ├── image_preprocessing.py # OpenCV grayscale, denoise, Otsu threshold, deskew
│   │   └── text_segmentation.py   # Regex question boundary detection (Q1..Qn)
│   ├── __init__.py
│   └── main.py                    # FastAPI server entrypoint and CORS middleware
├── .env                           # Local environment secrets (ignored by Git)
├── .env.example                   # Configuration template
├── .gitignore                     # Python, venv, and cache exclusions
└── requirements.txt               # Pinned Python package dependencies
```

---

## ⚙️ Prerequisites

- **Python**: Version `3.10`, `3.11`, or `3.12` (`python3 --version` or `py --version`)
- **Tesseract OCR**: Recommended for image optical character recognition:
  - macOS: `brew install tesseract`
  - Ubuntu / Debian: `sudo apt-get install -y tesseract-ocr libtesseract-dev`
  - Windows: [UB-Mannheim Tesseract installer](https://github.com/UB-Mannheim/tesseract/wiki)

> **Note on PDFs:** PyPDF extracts digital text from PDFs natively without needing Tesseract. Tesseract is used for scanned physical paper photographs.

---

## 🔑 How to Get API Keys (Gemini & OpenAI)

### 🌟 Option A: Google Gemini API Key *(Recommended & Free Tier)*
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Log in with any Google account.
3. Click **"Get API key"** in the sidebar.
4. Click **"Create API key"** (select or create a Google Cloud project).
5. Copy the generated API key (format: `AIzaSy...`).

### 🤖 Option B: OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/).
2. Log in and navigate to **API Keys** under your dashboard.
3. Click **"+ Create new secret key"**.
4. Copy the secret key (format: `sk-proj-...`).

---

## ⚙️ Environment Configuration

In the `ai-service/` directory, create a `.env` file based on `.env.example`:

```bash
# macOS / Linux
cp .env.example .env

# Windows
copy .env.example .env
```

### Configuration Options:

```env
# 1. Using Google Gemini (Recommended)
GEMINI_API_KEY=AIzaSyYourCopiedKeyHere
OPENAI_API_KEY=
AI_PROVIDER=GEMINI
AI_MOCK_MODE=false
PORT=8000

# 2. Using OpenAI
# GEMINI_API_KEY=
# OPENAI_API_KEY=sk-proj-YourCopiedKeyHere
# AI_PROVIDER=OPENAI
# AI_MOCK_MODE=false
# PORT=8000

# 3. Hackathon Presentation Offline Mode (Zero External Network Dependency)
# AI_MOCK_MODE=true
```

> [!TIP]
> **What is `AI_MOCK_MODE=true`?**  
> If internet access is slow, API quotas are exceeded, or you are presenting offline to hackathon judges, set `AI_MOCK_MODE=true`.  
> The service will use an intelligent local deterministic evaluator that parses the question, model answer, and rubric to return realistic, pedagogical evaluations with zero API latency and 100% presentation safety.

---

## 🚀 Step-by-Step Setup & Run Guide

### 🍎 macOS Setup
```bash
cd ai-service

# 1. Install Tesseract OCR (via Homebrew)
brew install tesseract

# 2. Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```
> Server starts on: **`http://localhost:8000`**  
> Interactive OpenAPI Docs: **`http://localhost:8000/docs`**

---

### 🪟 Windows Setup (Command Prompt or PowerShell)
```cmd
cd ai-service

REM 1. Create Python virtual environment
python -m venv venv

REM 2. Activate virtual environment
REM In Command Prompt:
venv\Scripts\activate.bat
REM In PowerShell:
REM .\venv\Scripts\Activate.ps1

REM 3. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

REM 4. Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

> **Windows Tesseract Note:** If you installed Tesseract from UB-Mannheim, add `C:\Program Files\Tesseract-OCR` to your System `PATH` environment variable.

---

### 🐧 Linux Setup (Ubuntu / Debian / CentOS / Fedora)
```bash
cd ai-service

# 1. Install system dependencies & Tesseract
sudo apt update
sudo apt install -y python3-venv python3-pip tesseract-ocr libtesseract-dev libgl1-mesa-glx

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install packages
pip install --upgrade pip
pip install -r requirements.txt

# 4. Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📡 REST API Endpoints & Testing

### 1. Health Check
- **Endpoint**: `GET /ai/health`
- **Response**:
```json
{
  "status": "healthy",
  "mock_mode": false,
  "provider": "GEMINI"
}
```

### 2. OCR Document Processing
- **Endpoint**: `POST /ai/ocr`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (PDF, PNG, JPG, JPEG, TIFF)
- **Response**:
```json
{
  "success": true,
  "rawText": "Q1. Explain inheritance in Java...\nQ2. What is an Exception...",
  "answers": [
    {
      "questionNumber": 1,
      "text": "Inheritance allows a subclass to acquire methods from a parent class using the extends keyword.",
      "ocrConfidence": 0.92
    },
    {
      "questionNumber": 2,
      "text": "Exceptions are abnormal runtime conditions handled via try, catch, and finally blocks.",
      "ocrConfidence": 0.89
    }
  ]
}
```

### 3. Pedagogical AI Evaluation
- **Endpoint**: `POST /ai/evaluate`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "question": "Explain inheritance in Java and its benefits.",
  "maxMarks": 10.0,
  "modelAnswer": "Inheritance is an OOP mechanism where a subclass inherits state and behavior from a superclass using extends. Benefits include code reusability, polymorphism, and maintainability.",
  "rubric": "Definition: 2 marks, Code reusability: 3 marks, Syntax/extends: 2 marks, Example/overriding: 3 marks",
  "studentAnswer": "Inheritance allows a child class to inherit fields and methods from a parent class. It uses the extends keyword. It promotes code reusability and method overriding."
}
```

- **Response Body**:
```json
{
  "suggestedMarks": 8.0,
  "maxMarks": 10.0,
  "confidence": 0.92,
  "matchedConcepts": [
    "Child class inherits from parent class",
    "Uses the extends keyword",
    "Promotes code reusability",
    "Mentions method overriding"
  ],
  "missingConcepts": [
    "Concrete code demonstration / code snippet"
  ],
  "explanation": "The student explains the core inheritance definition, keyword, and benefits clearly. A full code snippet example was omitted, resulting in a 2-mark deduction."
}
```

#### Test with cURL:
```bash
curl -X POST http://localhost:8000/ai/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain inheritance in Java.",
    "maxMarks": 10.0,
    "modelAnswer": "Inheritance allows a subclass to derive properties from a superclass.",
    "rubric": "Definition: 5 marks, Benefits: 5 marks",
    "studentAnswer": "Inheritance allows a subclass to inherit properties from a superclass for code reuse."
  }'
```

---

## ❓ Troubleshooting & FAQs

- **Issue: `tesseract is not installed or it's not in your PATH`**
  - Verify installation: `tesseract --version`
  - On macOS: ensure `brew install tesseract` was run.
  - On Linux: ensure `sudo apt install tesseract-ocr` was run.
  - On Windows: add `C:\Program Files\Tesseract-OCR` to your system environment variables.
- **Issue: `ImportError: libGL.so.1: cannot open shared object file` on Linux**
  - OpenCV requires OpenGL libraries on headless Linux. Run:  
    `sudo apt-get install -y libgl1-mesa-glx libglib2.0-0`
- **Issue: Port 8000 is occupied**
  - Find and terminate the process:
    - macOS/Linux: `lsof -ti :8000 | xargs kill -9`
    - Windows: `netstat -ano | findstr :8000` and `taskkill /PID <PID> /F`
  - Or run on another port: `uvicorn app.main:app --port 8001` (remember to update `ai.service.url` in `backend/src/main/resources/application.properties`).
