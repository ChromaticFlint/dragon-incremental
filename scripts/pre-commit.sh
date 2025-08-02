#!/bin/bash

# Pre-commit script for Dragon Incremental
# This script runs tests, linting, and build checks before allowing commits

echo "🐉 Dragon Incremental - Pre-commit checks"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Function to run a command and check its exit status
run_check() {
    echo -e "${YELLOW}Running: $1${NC}"
    eval $1
    local exit_code=$?
    print_status $exit_code "$2"
    return $exit_code
}

# Initialize exit code
overall_exit_code=0

# Run TypeScript type checking
run_check "npm run build" "TypeScript compilation"
if [ $? -ne 0 ]; then
    overall_exit_code=1
fi

# Run linting
run_check "npm run lint" "ESLint checks"
if [ $? -ne 0 ]; then
    overall_exit_code=1
fi

# Run tests
run_check "npm run test:run" "Unit tests"
if [ $? -ne 0 ]; then
    overall_exit_code=1
fi

echo "=========================================="

if [ $overall_exit_code -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready to commit.${NC}"
else
    echo -e "${RED}💥 Some checks failed. Please fix the issues before committing.${NC}"
    echo ""
    echo "To run individual checks:"
    echo "  npm run lint        # Check code style"
    echo "  npm run test:run    # Run tests"
    echo "  npm run build       # Check TypeScript compilation"
fi

exit $overall_exit_code
