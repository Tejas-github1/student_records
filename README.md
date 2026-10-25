# 🎓 Online Examination & Academic Progress Tracking Platform

A modern, full-stack educational assessment platform designed for online examinations, immediate automated scoring, long-term academic progress visualization, and **automated WhatsApp failure notifications**.

---

## 🌟 Key Features

### 1. 🧑‍🎓 Student Dashboard & Examination Portal
- **Personalized Welcome**: Displays student name, ID (`STU102`), class/grade, and overall progress metrics.
- **Available Examinations**: View active, upcoming, and completed examinations.
- **Interactive Examination Room (`/student/exam/:id`)**:
  - Live countdown timer with auto-submit upon expiration.
  - Interactive multiple-choice question (MCQ) interface with 4 options.
  - Previous / Next buttons and question palette navigator (with answered, unanswered, and active indicators).
  - Auto-saving answers in real-time.
  - Confirmation modal showing answered vs. unanswered counts before submission.
  - Retake protection: Prevents multiple submissions unless retakes are explicitly allowed by the instructor.
- **Immediate Result Breakdown (`/student/result/:attemptId`)**:
  - Instant server-side scoring calculated right upon submission.
  - Prominent **PASS (Green)** or **FAIL (Red)** badge with score and percentage `(Marks / Total) × 100`.
  - Question-by-question review displaying the student's selected answer, correct answer, marks awarded, and detailed explanations.
- **Academic Progress Page (`/student/progress`)**:
  - Aggregate metrics: Total attempts, passed, failed, average percentage, highest mark, and lowest mark.
  - Improvement or decline trend indicator (e.g. `+15% vs previous exam`).
  - **Recharts Line Chart**: Score trajectory across consecutive examinations.
  - **Recharts Bar Chart**: Subject-wise performance comparison.
  - Historical exam results table with direct review links.

### 2. 🛡️ Admin & Teacher Dashboards
- **Administrative Control (`/admin/dashboard`)**:
  - Real-time KPI summary cards: Total Students, Total Exams, Exams Completed, Overall Pass %, Students Who Failed, and Students Requiring Attention.
  - Recharts visual analytics: Pass vs. Fail ratio donut chart, subject-wise averages bar chart.
  - Filterable by Class (`Grade 10`, `Grade 11`, `General`), Subject, and Result status (`PASS`, `FAIL`).
  - Struggling students alert list (students failing recent exams or averaging < 50%).
- **Student Roster Management (`/admin/students`)**:
  - Add, edit, and deactivate student accounts.
  - Search by name, student ID, or email with class and status filters.
- **Examination Authoring (`/admin/exams`)**:
  - Dynamic MCQ question builder (add/remove questions, set options A-D, mark correct radio option, assign points).
  - Configure duration (minutes), total marks, passing marks threshold, and retake policies.
  - Publish / Unpublish toggle and preview mode.
- **All Results & Reports (`/admin/results`)**:
  - Searchable, filterable list of all student submissions with pagination and full question audit modal.
- **Class Progress Analytics (`/admin/progress`)**:
  - Class-wide comparative dashboard identifying students falling behind.

### 3. 📱 Automatic WhatsApp Failure Notifications
- **Configured Recipient**: `+91 6305497264` (configurable via `WHATSAPP_RECIPIENT` in `.env`).
- **Trigger**: Automatically dispatched by the server **strictly when a student receives a FAIL result**.
- **Message Format**:
  ```text
  ⚠️ STUDENT EXAM ALERT

  A student has failed an examination.

  Student Name: Rahul
  Student ID: STU102
  Exam: Python Basics Examination
  Marks Obtained: 10/40
  Percentage: 25%
  Passing Marks: 20
  Result: FAIL

  Please review the student's performance and provide the required guidance.
  ```
- **Audit & Deduplication**:
  - Deduplication lock ensures **only one failure notification** is ever sent per exam attempt.
  - Does **not** send notifications for passing scores.
  - All alerts are permanently logged in the `Notification` collection with status (`SENT`, `FAILED`, `NOT_CONFIGURED`), provider response, and timestamps.
- **Audit Center & Test Tool (`/admin/notifications`)**:
  - Configuration status banner clearly indicates if WhatsApp Cloud API credentials are set or unset (instead of pretending notifications succeeded).
  - **"Send Test WhatsApp Alert"** button allowing administrators to verify delivery to `+91 6305497264` on demand.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Recharts, Lucide React, Axios, React Router v7 |
| **Backend** | Node.js, Express.js, REST API, JSON Web Tokens (JWT), Bcrypt.js, Axios |
| **Database** | MongoDB with Mongoose (Features zero-config embedded in-memory fallback) |
| **Testing** | Jest, Supertest, MongoMemoryServer |
| **Messaging** | Meta WhatsApp Business Cloud API |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Setup Backend
```bash
cd backend
npm install
```

Configure your environment variables in `backend/.env` (a template is pre-populated):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/student_exam_db
USE_MEMORY_DB=auto
JWT_SECRET=super_secure_exam_platform_jwt_secret_key_change_in_production
WHATSAPP_RECIPIENT=+91 6305497264
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_API_TOKEN=
```

> [!NOTE]
> **Zero-Config Database**: If a local or remote MongoDB instance is not detected, the backend will automatically initialize an embedded in-memory database and auto-seed initial users, exams, and sample attempts.

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

### 4. Seed Database (Optional Manual Seed)
```bash
cd backend
npm run seed
```

### 5. Start the Application

**Terminal 1 - Backend API:**
```bash
cd backend
npm start
# Server starts at http://localhost:5000
```

**Terminal 2 - Frontend Web Client:**
```bash
cd frontend
npm run dev
# Vite dev server starts at http://localhost:3000
```

Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## 🔐 Default Demo Accounts

For instant evaluation, the login page features **1-Click Quick Demo Sign In** buttons:

| Role | Email | Password | Student ID / Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `Admin@123` | Full administrative permissions |
| **Teacher** | `teacher@example.com` | `Teacher@123` | Faculty monitor for Grade 10 |
| **Student (Rahul)** | `student1@example.com` | `Student@123` | `STU102` (Has past passed & failed exams) |
| **Student (Priya)** | `student2@example.com` | `Student@123` | `STU103` (High performer) |
| **Student (Amit)** | `student3@example.com` | `Student@123` | `STU104` (New student) |

---

## 🧪 Automated Testing

Run the automated test suite covering:
1. Server-side exam scoring and percentage rounding.
2. Pass/fail boundary decisions against passing mark thresholds.
3. Answer security: ensuring correct answers and explanations are stripped from student views.
4. WhatsApp failure notification trigger and deduplication protection.

```bash
cd backend
npm test
```

Test Results Output:
```text
PASS tests/examScoring.test.js
  1. Exam Scoring and Pass/Fail Decisions
    √ should mark score as FAIL when score is below passing marks (25/100 < 40)
    √ should mark score as PASS when score meets or exceeds passing marks (50/100 >= 40)
  2. Security & Role Permissions
    √ should NEVER expose correctAnswer or explanation to a student taking the exam
    √ should allow admin to view full exam with correctAnswer and explanation
    √ should reject student from creating an exam (role enforcement)
  3. WhatsApp Failure Notification & Deduplication
    √ should automatically record a failure alert when exam result is FAIL
    √ should NOT trigger notification when exam result is PASS
    √ should prevent duplicate notifications for the same failed exam attempt

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

---

## 📲 WhatsApp Cloud API Setup

To connect live WhatsApp messaging to Meta:
1. Register a Meta Developer account at [developers.facebook.com](https://developers.facebook.com).
2. Create an App with the **WhatsApp** product.
3. In the WhatsApp API Setup panel:
   - Copy your **Phone number ID** and set `WHATSAPP_PHONE_NUMBER_ID=...` in `backend/.env`.
   - Generate a **User Access Token** (or System User Token) and set `WHATSAPP_API_TOKEN=...` in `backend/.env`.
   - Add recipient `+91 6305497264` to your Meta verified test phone numbers list.
4. Restart the backend server.
5. In the Admin Dashboard, navigate to **WhatsApp Alerts** and click **Send Test WhatsApp Alert** to verify live delivery!

---

## 📁 Suggested Database Schema

- **`Users`**: User ID, name, email, hashed password, role (`admin`, `teacher`, `student`), student ID, class/grade, phone, and active status.
- **`Exams`**: Title, subject name, class/grade, duration in minutes, total marks, passing marks, retake allowance, status (`draft`, `published`), and questions array (MCQ options, correct answer index, points, explanation).
- **`ExamAttempts`**: Student ref, Exam ref, submitted answers, marks obtained, percentage, passing marks, result (`PASS` / `FAIL`), question reviews, time spent, auto-submit flag, and timestamps.
- **`Notifications`**: Student ref, ExamAttempt ref, recipient (`+91 6305497264`), message type, message body, status (`SENT`, `FAILED`, `NOT_CONFIGURED`), provider response, error message, and timestamps.
- **`Subjects`**: Subject title, code, class/grade, assigned teacher reference.

---

## 📄 License
ISC License. Built for educational and institutional online assessments.
