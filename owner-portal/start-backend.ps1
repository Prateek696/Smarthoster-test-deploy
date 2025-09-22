# Start Backend Server Script
Write-Host "Starting Owner Portal Backend..." -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "backend/package.json")) {
    Write-Host "Error: Please run this script from the owner-portal directory" -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
Set-Location backend

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the backend server
Write-Host "Starting backend server on http://localhost:5000..." -ForegroundColor Green
npm run dev



