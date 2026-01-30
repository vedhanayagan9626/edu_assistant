$currentDir = Get-Location

# 1. Start Backend
Write-Host "Starting Backend Service..." -ForegroundColor Cyan
Set-Location "edu_assistant\backend"
# Start Backend in background
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", ".\venv\Scripts\Activate.ps1; `$env:FLASK_APP='run.py'; flask run --host=0.0.0.0 --port=5000" -NoNewWindow

# 2. Start Frontend
Write-Host "Starting Frontend Service..." -ForegroundColor Cyan
Set-Location "$currentDir\edu_assistant\frontend"
Write-Host "Application will be available at http://localhost:5173"
npm run dev
