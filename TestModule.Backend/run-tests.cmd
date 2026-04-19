@echo off
echo [TESTS] Starting test infrastructure...
docker-compose -f docker-compose.test.yml up -d --build

echo [TESTS] Waiting for database (5433) and migrations to finish...
:: Увеличиваем ожидание или используем цикл проверки порта, если нужно. Пока просто 15 сек.
timeout /t 15 /nobreak > nul

echo [TESTS] Running integration tests...
dotnet test TestModule.Backend.IntegrationTests/TestModule.Backend.IntegrationTests.csproj --configuration Debug

echo [TESTS] Cleaning up...
docker-compose -f docker-compose.test.yml down -v
echo [TESTS] Done.
