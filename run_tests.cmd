@echo off
echo Running E2E Frontend Tests...
cd frontend
cmd /c npx playwright test --project chromium
pause
