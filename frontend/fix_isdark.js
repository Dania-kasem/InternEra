const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // If it uses isDark but doesn't have useTheme imported
      if (content.includes('isDark') && !content.includes('const { isDark } = useTheme()') && !content.includes('const [isDark')) {
        // Add import
        const importStatement = `import { useTheme } from '../../context/ThemeContext';\n`;
        if (!content.includes('useTheme')) {
          content = content.replace(/(import .*?from 'react[^']*';\n)/, `$1${importStatement}`);
        }

        // Find the component function declaration and insert `const { isDark } = useTheme();`
        // like `function CompanyLogin() {` or `export function CompanyLogin() {`
        const funcRegex = /(function\s+\w+\s*\([^)]*\)\s*\{|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)/;
        content = content.replace(funcRegex, `$1\n  const { isDark } = useTheme();\n`);

        fs.writeFileSync(fullPath, content);
        console.log(`Fixed isDark in ${fullPath}`);
      }
    }
  }
}

processDir(pagesDir);
