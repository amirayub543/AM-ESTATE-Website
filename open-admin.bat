@echo off
title AM Estate - Admin Control Panel
cd /d "%~dp0"

echo.
echo ========================================================
echo         AM Estate & Builders - Admin CMS Portal
echo ========================================================
echo.
echo Website & Admin Panel start ho raha hai...
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js installed nahi hai. https://nodejs.org se install karain.
  pause
  exit /b 1
)

:: Check if server is already running on port 3000
netstat -ano | findstr :3000 >nul 2>nul
if errorlevel 1 (
  echo Local server start ho raha hai, 5-8 seconds intezar karain...
  start "" cmd /c "timeout /t 5 >nul & start http://localhost:3000/admin"
  call npm run dev
) else (
  echo Server pehlay se chal raha hai.
  echo Browser mein Admin Panel khul raha hai: http://localhost:3000/admin
  start http://localhost:3000/admin
)
