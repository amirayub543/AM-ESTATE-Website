@echo off
title AM Estate Website - Vercel Deploy
cd /d "%~dp0.."

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js installed nahi hai. https://nodejs.org se LTS install karain.
  pause
  exit /b 1
)

echo.
echo Website Vercel par upload ho rahi hai. Internet chahiye.
echo Pehli dafa ye login aur kuch sawal poochay ga (neechay jawab likhay hain):
echo.
echo   Set up and deploy?              Y
echo   Which scope?                    apna account chunain (Enter)
echo   Link to existing project?       Y
echo   What's the name of your project?  jo naam Vercel par hai (maslan amestate)
echo.
call npx --yes vercel@latest --prod
echo.
echo Agar oopar "Production: https://..." likha aya hai to website live hai.
echo Agar error aya hai to is window ka screenshot bhej dain.
pause
