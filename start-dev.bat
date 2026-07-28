@echo off
cd /d "%~dp0web"

echo 資格勉強アプリを起動しています...
echo このウィンドウを閉じるとサーバーが停止します。

start "" cmd /c "timeout /t 4 >nul && start http://localhost:3000"

npm run dev
