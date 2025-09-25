@echo off
cd /d "%~dp0"
echo 正在启动枪战游戏服务器...
echo 请在浏览器中访问: http://localhost:8000/index-shooter.html
python -m http.server 8000
echo 按任意键关闭服务器...
pause >nul