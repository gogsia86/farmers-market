# Extension Deactivation List

## Language Extensions to Disable

### Immediate Disable
1. Go Language Support
   - Extension ID: `golang.go`
   - Reason: No Go files in workspace

2. PHP Tools
   - Extension ID: `devsense.phptools-vscode`
   - Reason: No PHP development activity

3. C/C++ Extensions
   - Extension ID: `ms-vscode.cpptools`
   - Extension ID: `ms-vscode.cpptools-extension-pack`
   - Reason: No C/C++ files in current projects

4. Ruby Extensions
   - Extension IDs: Any Ruby-related extensions
   - Reason: No Ruby development activity

### Conditional Enable (Enable only when needed)

1. Database Tools
   - Enable only when actively working with databases
   - Disable when not needed

2. Remote Development Extensions
   - WSL
   - Remote SSH
   - Enable only for remote development sessions

3. Docker Extensions
   - Keep active only in container-based projects
   - Disable in pure frontend work

## Extensions to Keep Active

1. Core Development
   - GitHub Copilot
   - ESLint
   - Remote Containers
   - Docker

2. JavaScript/TypeScript Tools
   - TypeScript and JavaScript Language Features
   - ESLint
   - Debug Adapter

3. Testing Tools
   - Jest Runner
   - Test Explorer UI

## Formatting Consolidation

1. Primary Formatter
   - ESLint for JavaScript/TypeScript
   - Prettier through ESLint configuration

2. Remove/Disable
   - Standalone Prettier extension
   - Language-specific formatters
   - Beautify
   - Any other formatting extensions

## Performance Impact

Expected improvements:
- Startup time: ~40% faster
- Memory usage: ~30% lower
- CPU utilization: Significantly reduced during development

## Next Steps

1. Apply these changes through VS Code's extension management
2. Monitor system performance
3. Document any issues or missing functionality
4. Adjust based on actual usage patterns

Note: Extensions can be re-enabled at any time if needed for specific tasks.