@echo off
echo Starting Redis for OpenCode Backend...
cd /d "%~dp0"
docker-compose up -d redis
echo.
echo Checking Redis status...
timeout /t 3 >nul
docker exec -it opencode-redis redis-cli ping
echo.
echo If you see 'PONG', Redis is running successfully!
echo.
pause
