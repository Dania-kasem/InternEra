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
      let modified = false;

      // 1. Remove incorrectly placed 'const { isDark } = useTheme();'
      if (content.includes('function generateOTP() {\n  const { isDark } = useTheme();')) {
        content = content.replace('function generateOTP() {\n  const { isDark } = useTheme();', 'function generateOTP() {');
        modified = true;
      }
      
      // 2. Ensure 'isDark' is defined ONLY in the main component function, not generateOTP
      const baseName = path.basename(fullPath, '.js');
      const funcRegex = new RegExp("function \\s*" + baseName + "\\s*\\([^)]*\\)\\s*\\{");
      if (!content.match(funcRegex)) {
        const arrowRegex = new RegExp("const \\s*" + baseName + "\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\{");
        if (content.match(arrowRegex)) {
           if (!content.includes('const { isDark } = useTheme();') && content.includes('globalStyles(isDark)')) {
             content = content.replace(arrowRegex, "$&\n  const { isDark } = useTheme();");
             modified = true;
           }
        }
      } else {
         if (!content.includes('const { isDark } = useTheme();') && content.includes('globalStyles(isDark)')) {
             content = content.replace(funcRegex, "$&\n  const { isDark } = useTheme();");
             modified = true;
         }
      }

      // 3. Ensure import { useTheme } from '../../context/ThemeContext'; exists
      if (content.includes('isDark') && !content.includes('useTheme} from') && !content.includes('useTheme } from')) {
        let importDepth = '../../context/ThemeContext';
        if (dir === pagesDir) { importDepth = '../context/ThemeContext'; }
        content = `import { useTheme } from '${importDepth}';\n` + content;
        modified = true;
      }
      
      // 4. Fix Duplicate isDark in CompanyDashboard
      if (fullPath.includes('CompanyDashboard.js')) {
         // remove duplicate const { isDark }
         let parts = content.split('const { isDark } = useTheme();');
         if (parts.length > 2) {
             content = parts[0] + 'const { isDark } = useTheme();' + parts.slice(1).join('');
             modified = true;
         }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed ' + fullPath);
      }
    }
  }
}

processDir(pagesDir);
