@echo off
start cmd /k "cd eticket-server && npm run start"
start cmd /k "cd eticket-client && npm run preview"
timeout /t 5 /nobreak >nul
start http://localhost:4173/
