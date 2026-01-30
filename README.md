# 🎓 EduAssistant: Premium AI Learning Companion

An intelligent, document-aware chat ecosystem built with **RAG (Retrieval-Augmented Generation)** to help students master any subject using their own course materials.

![Premium UI Preview](C:/Users/vedha/.gemini/antigravity/brain/7831a0ec-f5d9-4ced-9569-3731a5175a17/chat_premium_ui_mockup_1769788766783.png)

## 🌟 Key Features

- **🧠 Smart RAG System**: Upload PDFs and chat with them. The AI uses local vectorized context for accurate answers.
- **✨ Premium Chat UI**: Production-ready interface with Markdown support, code highlighting, and glassmorphism.
- **🚀 One-Click Setup**: Automated environment configuration for both local and cloud services.
- **🔋 Ollama Powered**: High-speed local LLM execution with dual-model fallback support.

---

## ⚡ Quick Start

Follow these steps to get the platform running on your local machine in minutes.

### 1. Prerequisites
Ensure you have the following installed:
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Ollama](https://ollama.com/) (Download and run `ollama pull llama3.2`)

### 2. Setup & Run (Single Command)
Clone the repo and run the universal setup script from the root folder:

```powershell
.\setup-and-run.ps1
```

*This script will automatically detect your environment, install dependencies, initialize the database, and launch both services.*

---

## 🛠️ Developer Manual

### File Structure
- `edu_assistant/backend/`: Flask API, RAG Service, and SQLite DB.
- `edu_assistant/frontend/`: React + Vite + Tailwind CSS.
- `setup-and-run.ps1`: The primary entry point for deployment.

### Useful Commands
| Task | Command (from root) |
| :--- | :--- |
| **Run Everything** | `.\setup-and-run.ps1` |
| **Just Frontend** | `cd edu_assistant/frontend; npm run dev` |
| **Just Backend** | `cd edu_assistant/backend; .\venv\Scripts\Activate.ps1; flask run` |
| **Seed DB** | `flask seed-data` (requires backend venv) |

### 🔧 Troubleshooting
- **LLM Timeout**: If the AI is slow, ensure Ollama is running and has GPU access. We've set a 5-minute timeout to handle slower CPU generation.
- **RAG Missing Context**: If "0 chunks found", ensure you've uploaded PDFs for the specific subject and that your `.env` paths are absolute.
- **CSS Errors**: Ensure you have run `npm install` to get the latest Tailwind v4 PostCSS plugins.

---

## 🔒 License
Built for educational excellence. © 2026 EduAssistant Team.
