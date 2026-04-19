#!/bin/bash
set -e

echo "[TESTS] Starting test infrastructure..."
docker-compose -f docker-compose.test.yml up -d --build

echo "[TESTS] Waiting for database to be ready..."
# Ждем 10 секунд для уверенности
sleep 10

echo "[TESTS] Running integration tests..."
dotnet test TestModule.Backend.IntegrationTests/TestModule.Backend.IntegrationTests.csproj --configuration Debug

echo "[TESTS] Cleaning up..."
docker-compose -f docker-compose.test.yml down -v

echo "[TESTS] Done."
