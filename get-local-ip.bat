@echo off
for /f "tokens=14 delims= " %%i in ('ipconfig ^| findstr /i "IPv4"') do echo Your PC local IP: %%i
pause
