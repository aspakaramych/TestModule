@echo off
echo Running E2E Frontend Tests in HEADED mode (Visual)...
cd frontend
cmd /c npx playwright test --project chromium --headed
pause
