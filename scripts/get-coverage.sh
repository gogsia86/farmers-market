#!/bin/bash

# Coverage Extraction Script for Farmers Market Platform
# Runs tests with coverage and extracts summary

echo "🧪 Running tests with coverage..."
echo "⏰ This may take 2-3 minutes..."
echo ""

# Run tests with coverage, capture output
npm run test:coverage -- --bail=false --maxWorkers=4 2>&1 | tee coverage-output.txt

# Extract coverage summary from output
echo ""
echo "📊 Extracting coverage summary..."
echo ""

# Look for coverage table in output
if grep -q "All files" coverage-output.txt; then
    echo "✅ Coverage data found!"
    echo ""
    grep -A 20 "All files" coverage-output.txt | head -n 25
else
    echo "⚠️  No coverage summary found in output"
    echo "Checking for lcov-report..."

    if [ -d "coverage/lcov-report" ]; then
        echo "✅ HTML coverage report generated at: coverage/lcov-report/index.html"
        echo ""
        echo "To view:"
        echo "  - Open coverage/lcov-report/index.html in your browser"
        echo "  - Or run: open coverage/lcov-report/index.html (macOS)"
        echo "  - Or run: start coverage/lcov-report/index.html (Windows)"
    fi
fi

# Check if coverage JSON exists
if [ -f "coverage/coverage-summary.json" ]; then
    echo ""
    echo "📄 Coverage JSON summary available at: coverage/coverage-summary.json"
fi

# Display test summary
echo ""
echo "🎯 Test Summary:"
grep -E "Test Suites:|Tests:" coverage-output.txt | tail -n 2

echo ""
echo "✅ Coverage analysis complete!"
echo "📁 Full output saved to: coverage-output.txt"
