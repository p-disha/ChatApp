# PowerShell script to deploy to Render
Write-Host "🚀 Preparing to deploy to Render..." -ForegroundColor Green
Write-Host ""

# Check if git is installed
try {
    git --version | Out-Null
    Write-Host "✓ Git found" -ForegroundColor Green
} catch {
    Write-Host "✗ Git not found. Please install Git first." -ForegroundColor Red
    exit 1
}

# Initialize git if not already
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - WebSocket chat app"
    git branch -M main
}

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a new repository on GitHub: https://github.com/new"
Write-Host "2. Name it: websocket-chat"
Write-Host "3. DON'T initialize with README"
Write-Host "4. Copy the repository URL"
Write-Host ""
Write-Host "Then run:" -ForegroundColor Yellow
Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/websocket-chat.git"
Write-Host "  git push -u origin main"
Write-Host ""
Write-Host "Finally:" -ForegroundColor Yellow
Write-Host "1. Go to https://render.com"
Write-Host "2. Sign up and connect GitHub"
Write-Host "3. Click 'New +' → 'Web Service'"
Write-Host "4. Select your repository"
Write-Host "5. Set Start Command: node server.js"
Write-Host "6. Click 'Create Web Service'"
Write-Host ""
Write-Host "📄 See DEPLOY_INSTRUCTIONS.txt for detailed guide" -ForegroundColor Cyan

