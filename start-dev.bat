@echo off
cd /d "%~dp0web"

echo Starting studyapp dev server...
echo Close this window to stop the server.

start "" cmd /c "timeout /t 4 >nul && start http://localhost:3000"

npm run dev
