@echo off
cd /d "%~dp0"
python -m http.server 8000
echo 按任意键关闭...
pause >nul