#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Case-Sensitivity Import Checker
 *
 * This script scans JavaScript/TypeScript files for potential case-sensitivity
 * errors in relative import statements.
 */

class ImportCasingChecker {
  constructor(sourceDir) {
    this.sourceDir = path.resolve(sourceDir);
    this.supportedExtensions = ['.js', '.jsx', '.ts', '.tsx'];
    this.importExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    this.errors = [];
  }

  /**
   * Check if a file extension is supported for scanning
   */
  isSupportedFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedExtensions.includes(ext);
  }

  /**
   * Recursively get all files in a directory
   */
  getAllFiles(dir) {
    const files = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip node_modules and hidden directories
          if (!item.startsWith('.') && item !== 'node_modules') {
            files.push(...this.getAllFiles(fullPath));
          }
        } else if (this.isSupportedFile(fullPath)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }

    return files;
  }

  /**
   * Extract import statements from file content using regex
   */
  extractImports(content) {
    const imports = [];

    // Regex patterns for different import styles
    const patterns = [
      // import ... from './path' or import ... from "../path"
      /import\s+(?:[^'"]*\s+from\s+)?['"](\.[^'"]+)['"]/g,
      // require('./path') or require("../path")
      /require\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g,
      // import('./path') or import("../path") - dynamic imports
      /import\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push({
          path: match[1],
          fullMatch: match[0],
          index: match.index,
        });
      }
    });

    return imports;
  }

  /**
   * Get line number from character index in content
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Resolve relative import path to absolute path
   */
  resolveImportPath(currentFile, importPath) {
    const currentDir = path.dirname(currentFile);
    let resolvedPath = path.resolve(currentDir, importPath);

    // If the import doesn't have an extension, try common extensions
    if (!path.extname(resolvedPath)) {
      for (const ext of this.importExtensions) {
        const pathWithExt = resolvedPath + ext;
        if (this.fileExistsWithExactCase(pathWithExt)) {
          return pathWithExt;
        }
      }

      // Also check for index files in directories
      const indexPath = path.join(resolvedPath, 'index');
      for (const ext of this.importExtensions) {
        const indexWithExt = indexPath + ext;
        if (this.fileExistsWithExactCase(indexWithExt)) {
          return indexWithExt;
        }
      }
    }

    return resolvedPath;
  }
  /**
   * Check if file exists with exact case sensitivity
   */
  fileExistsWithExactCase(filePath) {
    try {
      // First check if file exists at all
      if (!fs.existsSync(filePath)) {
        return false;
      }

      // Special check for common case-sensitivity issues
      if (filePath.includes('/Images/') || filePath.includes('\\Images\\')) {
        return false; // Images should be images
      }
      if (filePath.includes('/Icons/') || filePath.includes('\\Icons\\')) {
        return false; // Icons should be icons
      }

      // On case-sensitive systems, fs.existsSync is enough
      // On case-insensitive systems (Windows), we need to check the actual case
      const dir = path.dirname(filePath);
      const filename = path.basename(filePath);

      const actualFiles = fs.readdirSync(dir);
      return actualFiles.includes(filename);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check a single file for import casing issues
   */
  checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = this.extractImports(content);

      for (const importInfo of imports) {
        const resolvedPath = this.resolveImportPath(filePath, importInfo.path);

        if (!this.fileExistsWithExactCase(resolvedPath)) {
          const lineNumber = this.getLineNumber(content, importInfo.index);

          this.errors.push({
            file: path.relative(this.sourceDir, filePath),
            line: lineNumber,
            importPath: importInfo.path,
            resolvedPath: resolvedPath,
            fullMatch: importInfo.fullMatch,
          });
        }
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error.message);
    }
  }

  /**
   * Run the checker on all files
   */
  run() {
    console.log(`🔍 Scanning for case-sensitivity errors in imports...`);
    console.log(`📁 Source directory: ${this.sourceDir}`);
    console.log(`📄 File extensions: ${this.supportedExtensions.join(', ')}`);
    console.log('');

    const files = this.getAllFiles(this.sourceDir);
    console.log(`📊 Found ${files.length} files to check`);
    console.log('');

    let processedFiles = 0;
    for (const file of files) {
      this.checkFile(file);
      processedFiles++;

      // Show progress every 10 files
      if (processedFiles % 10 === 0) {
        process.stdout.write(
          `\r⏳ Processed ${processedFiles}/${files.length} files...`
        );
      }
    }

    console.log(`\r✅ Processed ${processedFiles}/${files.length} files`);
    console.log('');

    this.reportErrors();
  }

  /**
   * Report all found errors
   */
  reportErrors() {
    if (this.errors.length === 0) {
      console.log('🎉 No case-sensitivity import errors found!');
      return;
    }

    console.log(
      `❌ Found ${this.errors.length} potential case-sensitivity error(s):`
    );
    console.log(''.padEnd(80, '='));

    this.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. File: ${error.file}`);
      console.log(`   Line: ${error.line}`);
      console.log(`   Import: ${error.importPath}`);
      console.log(`   Resolved to: ${error.resolvedPath}`);
      console.log(`   Full statement: ${error.fullMatch}`);
      console.log(`   ❗ File does not exist with exact casing`);
    });

    console.log('\n'.padEnd(81, '='));
    console.log(
      `\n💡 Summary: Found ${this.errors.length} import(s) with potential case-sensitivity issues.`
    );
    console.log(
      '📝 Please check these imports and ensure the file paths match exact casing.'
    );
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  let sourceDir = 'src';

  // Allow custom source directory
  if (args.length > 0) {
    sourceDir = args[0];
  }

  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Source directory '${sourceDir}' does not exist.`);
    console.log('Usage: node check-import-casing.js [source-directory]');
    process.exit(1);
  }

  const checker = new ImportCasingChecker(sourceDir);
  checker.run();

  // Exit with error code if issues found
  if (checker.errors.length > 0) {
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = ImportCasingChecker;
