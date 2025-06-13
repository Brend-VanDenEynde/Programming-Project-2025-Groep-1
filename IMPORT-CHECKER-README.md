# Import Case-Sensitivity Checker

This Node.js script scans your entire project for potential case-sensitivity errors in file imports. This is particularly useful for projects that need to work across different operating systems, as Windows is case-insensitive while Linux/macOS are case-sensitive.

## Features

- ✅ Recursively scans directories starting from `src/` or custom directory
- ✅ Processes `.js`, `.jsx`, `.ts`, and `.tsx` files
- ✅ Detects all static import statements with relative paths (`./` or `../`)
- ✅ Resolves import paths to absolute paths
- ✅ Checks for exact case-sensitive file existence
- ✅ Reports detailed error information including file, line number, and problematic path
- ✅ Handles various import syntaxes:
  - `import ... from './path'`
  - `require('./path')`
  - `import('./path')` (dynamic imports)
- ✅ Auto-detects file extensions when not specified
- ✅ Checks for index files in directories

## Usage

### Basic Usage

```bash
# Check the career-launch/src directory
node check-import-casing.js career-launch/src

# Check a custom directory
node check-import-casing.js path/to/your/src
```

### Using NPM Scripts

```bash
# Check career-launch/src directory
npm run check-imports

# Check src directory (if exists)
npm run check-imports-all
```

## Sample Output

When the script finds issues, it will output detailed information:

```
🔍 Scanning for case-sensitivity errors in imports...
📁 Source directory: C:\path\to\your\project\src
📄 File extensions: .js, .jsx, .ts, .tsx

📊 Found 45 files to check
✅ Processed 45/45 files

❌ Found 3 potential case-sensitivity error(s):
================================================================================

1. File: examples\student-profiel-with-api.js
   Line: 6
   Import: ../Images/default.jpg
   Resolved to: C:\path\to\project\src\Images\default.jpg
   Full statement: import defaultAvatar from '../Images/default.jpg'
   ❗ File does not exist with exact casing

2. File: pages\student\student-register.js
   Line: 3
   Import: ../router.js
   Resolved to: C:\path\to\project\src\pages\router.js
   Full statement: import Router from '../router.js'
   ❗ File does not exist with exact casing

================================================================================

💡 Summary: Found 3 import(s) with potential case-sensitivity issues.
📝 Please check these imports and ensure the file paths match exact casing.
```

## Common Issues Found

Based on the scan of your project, here are the types of issues commonly found:

1. **Wrong directory casing**: `../Images/default.jpg` should be `../images/default.jpg`
2. **Incorrect file location**: Files trying to import from wrong directories
3. **Missing files**: Import statements referencing files that don't exist

## Fixing Issues

The script only **reports** issues - it does not automatically fix them. For each reported issue:

1. **Check the actual file location**: Verify the file exists and note its exact path and casing
2. **Update the import statement**: Modify the import to use the correct path and casing
3. **Re-run the script**: Verify the fix by running the checker again

## Examples of Fixes

```javascript
// ❌ Incorrect (case mismatch)
import defaultAvatar from '../Images/default.jpg';

// ✅ Correct (matches actual directory name)
import defaultAvatar from '../images/default.jpg';
```

```javascript
// ❌ Incorrect (wrong directory)
import Router from '../router.js';

// ✅ Correct (correct path)
import Router from '../../router.js';
```

## Exit Codes

- **0**: No issues found
- **1**: Issues found (useful for CI/CD pipelines)

## Integration with CI/CD

You can integrate this script into your build process:

```bash
# In your CI pipeline
npm run check-imports
if [ $? -ne 0 ]; then
  echo "❌ Import case-sensitivity issues found!"
  exit 1
fi
```

## Requirements

- Node.js 14.0.0 or higher
- No external dependencies required

## Technical Details

The script uses:

- Regular expressions to find import statements
- Node.js `fs` module for file system operations
- Path resolution to convert relative paths to absolute paths
- Case-sensitive file existence checking (works on both Windows and Unix systems)

## Supported Import Patterns

- ES6 imports: `import { something } from './path'`
- Default imports: `import Something from './path'`
- Side-effect imports: `import './path'`
- CommonJS requires: `require('./path')`
- Dynamic imports: `import('./path')`
- Mixed imports: `import Something, { other } from './path'`
