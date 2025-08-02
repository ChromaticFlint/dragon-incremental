@echo off
setlocal enabledelayedexpansion

echo 🐉 Dragon Incremental - Pre-commit checks
echo ==========================================

set overall_exit_code=0

echo Running: TypeScript compilation
call npm run build
if !errorlevel! neq 0 (
    echo ❌ TypeScript compilation failed
    set overall_exit_code=1
) else (
    echo ✅ TypeScript compilation passed
)

echo.
echo Running: ESLint checks
call npm run lint
if !errorlevel! neq 0 (
    echo ❌ ESLint checks failed
    set overall_exit_code=1
) else (
    echo ✅ ESLint checks passed
)

echo.
echo Running: Unit tests
call npm run test:run
if !errorlevel! neq 0 (
    echo ❌ Unit tests failed
    set overall_exit_code=1
) else (
    echo ✅ Unit tests passed
)

echo ==========================================

if !overall_exit_code! equ 0 (
    echo 🎉 All checks passed! Ready to commit.
) else (
    echo 💥 Some checks failed. Please fix the issues before committing.
    echo.
    echo To run individual checks:
    echo   npm run lint        # Check code style
    echo   npm run test:run    # Run tests
    echo   npm run build       # Check TypeScript compilation
)

exit /b !overall_exit_code!
