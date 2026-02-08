@echo off
cd /d D:\calculator\calculator

REM Start dev server
start "Next Dev Server" cmd /k npm run dev

REM Wait for server
timeout /t 6 > nul

REM Open localhost
start http://localhost:3000

echo.
echo ==============================
echo Local server started.
echo If page did not load:
echo - Check this window for errors
echo - Or refresh browser
echo ==============================
