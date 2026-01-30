Write-Host "Ollama Setup Script" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Ollama is installed
Write-Host "Step 1: Checking Ollama installation..." -ForegroundColor Green
try {
    $ollamaVersion = ollama --version
    Write-Host "✓ Ollama is installed: $ollamaVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Ollama is not installed. Please run: winget install Ollama.Ollama" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Download llama3.2 model
Write-Host "Step 2: Downloading llama3.2 model (this may take a few minutes)..." -ForegroundColor Green
ollama pull llama3.2

Write-Host "✓ llama3.2 downloaded successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Download mistral model (optional, smaller alternative)
Write-Host "Step 3: Downloading mistral model..." -ForegroundColor Green
ollama pull mistral

Write-Host "✓ mistral downloaded successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Test Ollama
Write-Host "Step 4: Testing Ollama connection..." -ForegroundColor Green
$testResponse = ollama list
if ($testResponse) {
    Write-Host "✓ Ollama is running and models are available" -ForegroundColor Green
} else {
    Write-Host "✗ Could not connect to Ollama" -ForegroundColor Red
}

Write-Host ""

# Step 5: Seed database
Write-Host "Step 5: Seeding database with Ollama models..." -ForegroundColor Green
Set-Location "edu_assistant\backend"
.\venv\Scripts\Activate.ps1
$env:FLASK_APP = "run.py"
flask seed-data

Write-Host ""
Write-Host "===================" -ForegroundColor Cyan
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your backend server (Ctrl+C, then: python run.py)" -ForegroundColor Yellow
Write-Host "2. Refresh your browser" -ForegroundColor Yellow
Write-Host "3. Try the chat - it will now use Ollama!" -ForegroundColor Yellow
