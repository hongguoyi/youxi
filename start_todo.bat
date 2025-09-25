@echo off

REM 检查是否安装了Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 未找到Python。请安装Python后再试。
    pause
    exit /b 1
)

REM 在当前目录启动HTTP服务器
cd /d "%~dp0"
echo 正在启动To-Do列表应用服务器...
echo 请在浏览器中访问 http://localhost:8000/todo.html
python -m http.server 8000

pause