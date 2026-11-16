@echo off
title AM Estate Website & Admin CMS
cd /d "%~dp0"

echo.
echo ========================================================
echo        AM Estate & Builders - Local Server
echo ========================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js installed nahi hai.
  echo https://nodejs.org se "LTS" version install karain, phir ye file dobara chalain.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Pehli dafa setup ho raha hai, dependencies install ho rahi hain...
  call npm install
  if errorlevel 1 (
    echo Install fail ho gaya. Internet check karain.
    pause
    exit /b 1
  )
)

echo.
echo Website live URL:  http://localhost:3000
echo Admin Panel URL:   http://localhost:3000/admin
echo Admin Password:    admin123
echo.
echo Browser khul raha hai... Band karnay k liye ye window close kar dain.
echo.

start "" cmd /c "timeout /t 6 >nul & start http://localhost:3000"
call npm run dev
pause
