# Sample Data & Test Answer Sheets

This directory contains pre-generated sample examination documents and test datasets designed for demonstrating the **AI-Driven Examination & On-Screen Marking Platform** at the **MPOnline Idea & Innovation Hackathon 2026**.

---

## 1. Provided Sample Files

| File Name | Format | Description |
| :--- | :--- | :--- |
| `scanned_answer_sheet_MP2026CS3088.pdf` | PDF Document | 5-Question university descriptive examination answer sheet for *Java Programming (CS301)*. |
| `scanned_answer_sheet_MP2026CS3088.png` | High-Res Image | Scanned handwritten/typed simulation image with OpenCV OCR testing headers. |

---

## 2. Seeded Candidate Profiles

| Candidate Reference | Examination | Pre-loaded State | Purpose in Demo |
| :--- | :--- | :--- | :--- |
| `MP-2026-CS-1042` | CS301 (Java Programming) | **Evaluated & Flagged** | Shows immediate dashboard stats, low-confidence flag on Q5 (68%), and pending moderation review. |
| `MP-2026-CS-3088` | CS301 (Java Programming) | **Finalized** | Demonstrates completed result marksheet, 70% (B+), and approved audit trail. |

---

## 3. How to Test a Live Answer Sheet Upload During Demo

1. Log in as **Examiner** (`examiner@example.com` / `examiner123`).
2. Go to **Evaluation Workspace** or click **Available Exams** &rarr; select *B.Tech Semester V Final Exam*.
3. Click **Upload Candidate Answer Sheet**.
4. Enter any roll number (e.g. `MP-2026-CS-9999`).
5. Choose `sample-data/scanned_answer_sheet_MP2026CS3088.pdf` or `scanned_answer_sheet_MP2026CS3088.png`.
6. Click **Upload & Start Marking**.
7. The system runs OpenCV preprocessing + OCR extraction and automatically opens the split-screen **On-Screen Marking Interface**.
