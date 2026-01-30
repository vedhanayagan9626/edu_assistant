$currentDir = Get-Location

# 1. Setup Backend
Write-Host "Setting up Backend..." -ForegroundColor Green
Set-Location "edu_assistant\backend"

# Check if venv exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv venv
}

# Activate venv
.\venv\Scripts\Activate.ps1

# Install requirements
Write-Host "Installing backend dependencies..."
pip install -r requirements.txt

# Download Model
Write-Host "Downloading embedding model..."
python download_model.py

# Initialize DB
Write-Host "Initializing Database..."
$env:FLASK_APP = "run.py"
flask init-db
flask seed-data

# Start Backend in background
Write-Host "Starting Backend Service..." -ForegroundColor Cyan
Start-Process -FilePath "flask" -ArgumentList "run --host=0.0.0.0 --port=5000" -NoNewWindow

# 2. Setup Frontend
Write-Host "Setting up Frontend..." -ForegroundColor Green
Set-Location "$currentDir\edu_assistant\frontend"

# Install dependencies if node_modules missing
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..."
    npm install
}

# Start Frontend
Write-Host "Starting Frontend Service..." -ForegroundColor Cyan
Write-Host "Application will be available at http://localhost:5173"
npm run dev
