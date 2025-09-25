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
echo 正在启动我的世界（简单版）游戏服务器...
echo 请在浏览器中访问 http://localhost:8000/minecraft.html
echo.
echo 游戏控制说明：
echo - W/S/A/D: 前后左右移动

echo - 空格键: 跳跃

echo - 箭头键: 控制视角

echo - 鼠标左键: 破坏方块

echo - 鼠标右键: 放置方块

echo - 数字键1-5: 选择方块类型
python -m http.server 8000

pause