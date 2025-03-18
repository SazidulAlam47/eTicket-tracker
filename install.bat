@echo off

echo Installing Puppeteer Chrome browser...
echo Y | npx puppeteer browsers install chrome

if %errorlevel% neq 0 (
    echo Failed to install Puppeteer. Exiting...
    exit /b %errorlevel%
)

echo Puppeteer installation completed successfully.

echo Setting up the backend...
start cmd /k "cd eticket-server && npm install && exit"

echo Setting up the frontend...
start cmd /k "cd eticket-client && npm install && npm run build && exit"

echo All setup processes have been started.

exit