@echo off
start cmd /k "cd eticket-server && npm install && exit"
start cmd /k "cd eticket-client && npm install && npm run build && exit"
