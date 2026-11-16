@echo off
title AM Estate - Mobile hero frames
cd /d "%~dp0.."

set "VIDEO=C:\Users\Dell-Pc\AppData\Local\Claude-3p\local-agent-mode-sessions\c5dcf671\00000000\c4d2c3d1\uploads\Untitled_Scene_11-12_21_34_41_0eee0bb3_t1.1-10.mp4"
if not exist "%VIDEO%" set "VIDEO=%CD%\public\video\hero-mobile.mp4"
if not exist "%VIDEO%" (
  echo.
  echo Video nahi mili. Mobile wali video ko is naam se yahan rakhain, phir ye file dobara chalain:
  echo   public\video\hero-mobile.mp4
  echo.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js installed nahi hai. https://nodejs.org se LTS install karain.
  pause
  exit /b 1
)

set "TOOLS=%TEMP%\am-estate-ffmpeg"
if not exist "%TOOLS%\node_modules\ffmpeg-static" (
  echo Video tool download ho raha hai, internet chahiye, 1-3 minute...
  call npm install --prefix "%TOOLS%" ffmpeg-static
  if errorlevel 1 (
    echo.
    echo Download fail ho gaya. Internet check kar k dobara chalain.
    pause
    exit /b 1
  )
)

echo.
echo Video k frames ban rahay hain...
node "lib\extract-mobile-frames.mjs" "%VIDEO%" "%TOOLS%"
if errorlevel 1 (
  echo.
  echo Frames nahi ban sakay. Is window ka screenshot bhej dain.
  pause
  exit /b 1
)

echo.
echo Ho gaya. Ab start-website.bat chalain aur mobile view main Ctrl+F5 karain.
pause
