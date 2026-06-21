# 🛡️ Cyber Suraksha AI

An advanced, AI-powered conversational platform designed to assist victims of cybercrime in registering complaints, analyzing suspicious links, and building robust digital safety habits.

[![Python Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React Frontend](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite Bundler](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2F%20In--Memory-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![LLM Inference](https://img.shields.io/badge/LLM-Groq%20Llama%203.3-orange)](https://groq.com)

---

## 📖 Table of Contents
1. [Core Features](#-core-features)
2. [Technology Stack](#%EF%B8%8F-technology-stack)
3. [Project Structure](#-project-structure)
4. [Getting Started](#%EF%B8%8F-getting-started)
   - [Prerequisites](#prerequisites)
   - [Backend Configuration](#1-backend-configuration)
   - [Frontend Configuration](#2-frontend-configuration)
5. [Security & Privacy Standards](#-security--privacy-standards)
6. [License](#-license)

---

## 🌟 Core Features

### 1. 💬 Conversational AI Reporting Assistant
* Powered by **Groq Low-Latency Llama 3.3 (70B Versatile)** inference.
* Guides victims through describing cyber fraud incidents in natural language.
* Extracts structured incident profiles matching government classification standards (UPI details, transaction IDs, scammer phone numbers).

### 2. 📄 Gov-Standard PDF Compiler
* Packages extracted profiles into official, structured incident complaint logs.
* Automates timeline reconstruction and groups fraud indicators.
* Generates a downloadable PDF report matching government portal submission standards.

### 3. 🔍 Link Safe-Scanner (Phishing & URL Analyzer)
* Analyzes suspicious URLs and calculates a custom **Risk Score** using heuristic checks.
* Scans for SSL/TLS validation, domain age, brand spoofing (e.g. `sbi-rewards.xyz`), and suspect TLD extensions (`.top`, `.apk`, `.xyz`).
* Generates detailed diagnostics broken down into Security Flags, Heuristics, and Domain Registrar details.

### 4. 📚 Interactive Awareness Hub
* Features **6 modular security blogs** covering prevalent cyber fraud vectors (UPI scams, identity theft, remote control tools).
* Contains an interactive **Secure Habit Builder** checklist to guide users in locking down their digital environments.
* Includes reading progress indicators (Mark as Read / Completed status).

---

## 🛠️ Technology Stack

| Layer | Technology | Key Use Case |
| :--- | :--- | :--- |
| **Frontend** | React 19 (JSX) | User interface, state management, and view routing |
| **Styling** | Vanilla CSS | Premium glassmorphism design system & micro-animations |
| **Build Tool** | Vite | Ultra-fast frontend bundling and hot module reloading (HMR) |
| **Backend** | FastAPI (Python) | High-performance asynchronous REST API routing |
| **Runner** | Uvicorn | ASGI server implementation |
| **Database** | MongoDB / In-Memory | Session logging and fraud report persistence |
| **AI Inference** | Groq SDK | Llama-3.3-70b-versatile natural language processing |

---

## 📁 Project Structure

```
Cyber-surakhya-AI/
├── backend/                  # FastAPI Application Layer
│   ├── .venv/                # Python Virtual Environment (ignored)
│   ├── app/
│   │   ├── routers/          # Modular API endpoint routers (chat, report, upload)
│   │   ├── services/         # LLM logic, PDF generation, and receipt parsers
│   │   ├── config.py         # Pydantic system settings & env configurations
│   │   ├── database.py       # MongoDB client with safe In-Memory fallback
│   │   ├── main.py           # Application bootstrapper and CORS config
│   │   └── schemas.py        # Pydantic schemas for request validation
│   ├── static/reports/       # Output folder for compiled PDFs (ignored)
│   ├── .env.example          # Template for backend settings
│   └── requirements.txt      # Python dependencies manifest
│
├── frontend/                 # React Dashboard Application
│   ├── node_modules/         # Node packages (ignored)
│   ├── src/
│   │   ├── main.jsx          # UI layout grid, views, and routing logic
│   │   └── styles.css        # Custom premium style sheet variables
│   ├── index.html            # SPA entry HTML
│   ├── vite.config.js        # Vite bundler parameters
│   └── package.json          # Node scripts and dependencies
│
└── .gitignore                # Repository filter rules
```

---

## ⚙️ Getting Started

### Prerequisites
* **Python 3.10+**
* **Node.js 18+**
* **Groq API Key** (Get one at [console.groq.com](https://console.groq.com))

---

### 1. Backend Configuration

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .\.venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install package dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   Modify `.env`:
   ```env
   GROQ_API_KEY=your_actual_groq_api_key_here
   MONGO_URI=mongodb://localhost:27017/cyber_suraksha
   ```
   > [!NOTE]
   > If MongoDB is not running locally, the backend will **gracefully fall back** to an in-memory dictionary database for sessions and report testing.

5. Start the backend server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

### 2. Frontend Configuration

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Boot the development server:
   ```bash
   npm run dev
   ```
   The dashboard UI will be live at [http://127.0.0.1:5173/](http://127.0.0.1:5173/).

---

## 🔒 Security & Privacy Standards

> [!IMPORTANT]
> **Data Security and Privacy is core to the application architecture:**
> * **Zero Permanent Key Exposure:** Real keys are never uploaded to git repositories. Always use `.env` configuration files.
> * **AES-256 GCM Storage Design:** The local client handles credentials in AES encrypted sandboxes.
> * **Identity Vault Masking:** The profile section features individual eye triggers allowing users to selectively reveal sensitive details (PAN, Aadhaar) on screen.
