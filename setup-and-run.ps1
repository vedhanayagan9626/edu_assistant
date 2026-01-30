# Universal Setup & Run Script for EduAssistant
# Run this from the root folder: .\setup-and-run.ps1

$ErrorActionPreference = "Stop"
$currentDir = Get-Location

Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "   EduAssistant: One-Click Setup & Run    " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

# 1. Prerequisite Checks
Write-Host "`n[1/5] Checking Prerequisites..." -ForegroundColor Cyan

function Check-Command($cmd, $name) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Error "$name is not installed. Please install it to continue."
    }
    Write-Host "  - $name: OK" -ForegroundColor Gray
}

Check-Command "python" "Python"
Check-Command "node" "Node.js"
Check-Command "npm" "npm"

# 2. Backend Setup
Write-Host "`n[2/5] Setting up Backend..." -ForegroundColor Cyan
Set-Location "edu_assistant\backend"

if (-not (Test-Path "venv")) {
    Write-Host "  - Creating virtual environment..." -ForegroundColor Gray
    python -m venv venv
}

Write-Host "  - Activating and installing dependencies..." -ForegroundColor Gray
& ".\venv\Scripts\Activate.ps1"
pip install --upgrade pip
pip install -r requirements.txt

# Create .env if missing
if (-not (Test-Path ".env")) {
    Write-Host "  - Creating default .env file..." -ForegroundColor Gray
    $envContent = @"
# Flask
SECRET_KEY=dev_secret_key
FLASK_APP=run.py
FLASK_ENV=development

# Database
DATABASE_URL=sqlite:///$(Join-Path $PWD "instance/dev.db")

# Paths
UPLOAD_FOLDER=$(Join-Path $PWD "uploads")
CHROMA_PERSIST_DIR=$(Join-Path $PWD "chroma_db")

# Models
EMBEDDING_MODEL=all-MiniLM-L6-v2
OLLAMA_BASE_URL=http://localhost:11434

# API Keys (Optional)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
"@
    $envContent | Out-File -FilePath ".env" -Encoding utf8
}

# Initialize DB
Write-Host "  - Initializing Database & Seed Data..." -ForegroundColor Gray
$env:FLASK_APP = "run.py"
flask init-db
flask seed-data

# Download Model
Write-Host "  - Verifying embedding models..." -ForegroundColor Gray
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# 3. Frontend Setup
Write-Host "`n[3/5] Setting up Frontend..." -ForegroundColor Cyan
Set-Location "$currentDir\edu_assistant\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "  - Installing node packages (this may take a minute)..." -ForegroundColor Gray
    npm install
}

# 4. Ollama Check
Write-Host "`n[4/5] Verifying Ollama..." -ForegroundColor Cyan
if (Get-Process "ollama" -ErrorAction SilentlyContinue) {
    Write-Host "  - Ollama is already running: OK" -ForegroundColor Gray
} else {
    Write-Host "  - WARNING: Ollama is not detected! Please start the Ollama application." -ForegroundColor Yellow
}

# 5. Launch
Write-Host "`n[5/5] Launching Services..." -ForegroundColor Green
Set-Location $currentDir

# Start Backend in new window
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "Set-Location 'edu_assistant\backend'; .\venv\Scripts\Activate.ps1; `$env:FLASK_APP='run.py'; flask run --host=0.0.0.0 --port=5000"

# Start Frontend in current window
Write-Host "`nApplication starting! Frontend: http://localhost:5173 | Backend: http://localhost:5000" -ForegroundColor Cyan
Set-Location "edu_assistant\frontend"
npm run dev
