# 🖥️ E-Valuate AI — Frontend Web Application

> **User Interface for the MPOnline Idea & Innovation Hackathon 2026**  
> An intuitive, high-performance On-Screen Marking (OSM) and examination management dashboard built with React 19, Vite, and TailwindCSS v4.

---

## 📖 Overview

The **E-Valuate AI Frontend** is the primary interface used by University Administrators, Evaluators (Examiners), and Senior Moderators. Designed for high volume, zero-clutter evaluation workflows, it provides:

- **Split-Screen On-Screen Marking (OSM) Workspace**: Dual-pane evaluation workspace pairing the original digitized answer sheet (PDF or high-res image) with real-time extracted answers, rubric benchmarks, and AI suggestions.
- **Explainable AI (XAI) Displays**: Visual highlights of **Matched Concepts** (✓) and **Missing Concepts** (✗) alongside AI rationale, confidence indicators, and score recommendations.
- **Full Examiner Sovereignty**: AI marks are presented as editable recommendations. Examiners can accept, adjust, or completely override marks with a single click.
- **Role-Based Navigation**: Customized workspaces for **Admin**, **Examiner**, and **Moderator**, complete with 1-Click quick login buttons for hackathon demonstration.
- **Interactive Recharts Analytics**: Admin visual dashboards displaying evaluation throughput, question-wise score distributions, AI-vs-Examiner discrepancy trends, and difficulty ratings.
- **Audit & Result Certification**: Formal marksheet certificate view with grade calculation, moderation sign-off badge, and print stylesheet.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern UI component model with high-speed virtual DOM rendering |
| **Vite 8** | Ultra-fast lightning development server and optimized production bundler |
| **TailwindCSS v4** | Modern utility-first styling with modern color palettes and responsive layouts |
| **React Router 7** | Client-side routing with role-guarded routes (`ProtectedRoute`) |
| **Axios** | HTTP client configured with automated JWT interceptors and session handling |
| **Recharts** | Declarative charting library for evaluation progress, score variances, and difficulty curves |
| **Lucide React** | Clean, accessible vector icons across all dashboard panels |

---

## 📂 Project Structure

```text
frontend/
├── public/                 # Static assets, logos, and favicons
├── src/
│   ├── assets/             # Branding icons and hero graphics
│   ├── components/         # Reusable UI components
│   │   └── common/         # Navbar, Sidebar, Modal, ConfidenceBadge, StatusBadge
│   ├── context/            # Global React Contexts (AuthContext for user & token)
│   ├── layouts/            # Page layouts (MainLayout with role-aware navigation)
│   ├── pages/              # Application pages
│   │   ├── LoginPage.jsx               # Login with 1-Click demo role shortcuts
│   │   ├── AdminDashboardPage.jsx      # Recharts metrics and difficulty analytics
│   │   ├── AdminExamsPage.jsx          # Exam listing and creation modal
│   │   ├── AdminExamDetailPage.jsx     # Question authoring with multi-criteria rubrics
│   │   ├── ExaminerDashboardPage.jsx   # Assigned exams and candidate sheets
│   │   ├── ExaminerExamDetailPage.jsx  # Candidate answer sheet uploads (PDF/Images)
│   │   ├── OnScreenMarkingPage.jsx     # Split-screen OSM evaluation workspace
│   │   ├── ModeratorDashboardPage.jsx  # Flagged reviews (low confidence, variance >=3)
│   │   └── ResultSummaryPage.jsx       # Certified marksheet certificate & print view
│   ├── services/           # Backend API integration (Axios client with JWT auth)
│   ├── App.css             # Component-level styles
│   ├── App.jsx             # Route definitions and security wrappers
│   ├── index.css           # Global Tailwind CSS imports
│   └── main.jsx            # React root application entrypoint
├── .env.example            # Environment configuration template
├── package.json            # Node.js dependencies and scripts
└── vite.config.js          # Vite build and server settings
```

---

## ⚙️ Prerequisites

- **Node.js**: `v18.x`, `v20.x`, or `v22.x` (LTS recommended)
- **npm**: `v9.x` or `v10.x` (comes with Node.js)
- Verify installation:
  ```bash
  node -v
  npm -v
  ```

---

## 🚀 Step-by-Step Setup & Run Guide

### 1. Environment Configuration

In the `frontend` folder, create a `.env` file based on `.env.example`:

```bash
# macOS / Linux
cp .env.example .env

# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

Ensure the API base URL points to your running Spring Boot backend (default port `8080`):
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

### 2. Operating System-Specific Instructions

#### 🍎 macOS
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
> The application will start at: **`http://localhost:5173`**

---

#### 🪟 Windows (Command Prompt or PowerShell)
```cmd
cd frontend

REM Install dependencies
npm install

REM Start development server
npm run dev
```
> If Windows Firewall asks for network access, click **"Allow access"**.  
> The application will start at: **`http://localhost:5173`**

---

#### 🐧 Linux (Ubuntu / Debian / CentOS / Fedora)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev -- --host 0.0.0.0
```
> Specifying `--host 0.0.0.0` allows you to access the frontend from other machines on your local network if needed.

---

## 🔑 Demo Access Credentials

The login screen features **1-Click Demo Quick Access Buttons** for presentation convenience:

| Role Button | Pre-filled Email | Password | Allowed Capabilities |
| :---: | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` | Exam creation, Question & Rubric authoring, Analytics |
| **Examiner** | `examiner@example.com` | `examiner123` | Upload answer sheets, Split-screen OSM marking, Overrides |
| **Moderator** | `moderator@example.com` | `moderator123` | Review low-confidence flags, Large AI-vs-Examiner variances |

---

## 📜 Available NPM Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite hot-reloading dev server at `http://localhost:5173` |
| `npm run build` | Compiles and optimizes assets into production-ready `dist/` |
| `npm run preview` | Serves the production build locally for verification |
| `npm run lint` | Runs ESLint across all `.jsx` and `.js` source files |

---

## 🧪 Key Workflows to Test & Demonstrate

1. **Examiner On-Screen Marking**:
   - Log in as **Examiner**.
   - Select the seeded exam *CS301 - Java Programming*.
   - Open candidate **MP-2026-CS-1042** or upload a new PDF/image from `sample-data/`.
   - On the OSM page, observe the dual-pane view: original scan on the left, OCR text & AI suggestion on the right.
   - Click **"Accept AI Marks"** or use the numeric input to override the mark.
   - Click **"Save Marks"** and advance through questions using **"Next Question"**.
   - Click **"Finalize Evaluation"** to generate the certified result marksheet.
2. **Explainable AI (XAI)**:
   - Notice the green checkmarks (✓) for Matched Concepts and red crosses (✗) for Missing Concepts.
   - Observe the pedagogical explanation describing why points were awarded or deducted.
3. **Admin Dashboard Analytics**:
   - Log in as **Admin**.
   - Navigate to `/admin/dashboard`.
   - View the Recharts interactive analytics: Evaluation Progress donut, Average Marks bar chart, AI-vs-Examiner discrepancy lines, and Question Difficulty categorization.
4. **Moderation Queue**:
   - Log in as **Moderator**.
   - View flagged evaluations (e.g. Q5 flagged for low confidence or variance &ge; 3.0 marks).
   - Click **"Review"** to inspect and resolve the moderation alert.

---

## ❓ Troubleshooting & FAQs

- **Issue: Network Error / Cannot connect to API**
  - Verify that the Spring Boot backend is running on `http://localhost:8080`.
  - Check `frontend/.env` to ensure `VITE_API_BASE_URL=http://localhost:8080/api`.
  - Check browser console (F12) for CORS errors (CORS is pre-enabled in Spring Boot for `localhost:5173` and `localhost:3000`).
- **Issue: Port 5173 is already in use**
  - Vite will automatically attempt port 5174. If it does, update CORS settings or free port 5173:
    - macOS/Linux: `lsof -ti :5173 | xargs kill -9`
    - Windows: `netstat -ano | findstr :5173` followed by `taskkill /PID <PID> /F`
- **Issue: Tailwind styles not showing**
  - Vite 8 uses `@tailwindcss/vite` plugin imported in `vite.config.js`. Ensure your terminal ran `npm install` cleanly.
