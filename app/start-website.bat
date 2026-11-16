@echo off
title AM Estate Website - Local Server
cd /d "%~dp0.."

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js installed nahi hai.
  echo https://nodejs.org se "LTS" version install karain, phir ye file dobara chalain.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Pehli dafa setup ho raha hai, 3-10 minute lag saktay hain...
  call npm install
  if errorlevel 1 (
    echo.
    echo Install fail ho gaya. Internet aur disk space check karain.
    pause
    exit /b 1
  )
)

echo.
echo Website start ho rahi hai: http://localhost:3000
echo Band karnay k liye ye window close kar dain.
echo.
start "" cmd /c "timeout /t 8 >nul & start http://localhost:3000"
call npm run dev
pause
