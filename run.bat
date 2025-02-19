@echo off
echo Please wait, starting the server and client...
start cmd /k "cd eticket-server && npm run start"
start cmd /k "cd eticket-client && npm run preview"
timeout /t 5 /nobreak >nul
echo Opening the application...
start http://localhost:4173/
