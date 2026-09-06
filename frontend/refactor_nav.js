const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') && !fullPath.includes('LandingPage') && !fullPath.includes('Navbar') && !fullPath.includes('Theme')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      const isStudent = fullPath.includes('student');
      const isCompany = fullPath.includes('company');

      if (!isStudent && !isCompany) continue;

      const navComp = isStudent ? 'StudentNavbar' : 'CompanyNavbar';

      // Match exactly the ie-nav or sr-nav structure
      // <nav className="ie-nav ie-content"> ... </nav>
      // or <nav className="sr-nav"> ... </nav>
      const navRegex = /<nav className="[^"]+">[\s\S]*?<div className="[^"]*nav-logo"[^>]*>[\s\S]*?<\/div>([\s\S]*?)<\/nav>/;

      const match = content.match(navRegex);
      if (match) {
        let buttonsHtml = match[1].trim();
        // if the buttons are wrapped in a flex div, unwrap them if needed, or just pass as children
        // The flex div usually has style={{ display: 'flex' ...
        if (buttonsHtml.startsWith('<div style={{ display: \'flex\'')) {
          // extract inside
          const innerMatch = buttonsHtml.match(/<div[^>]*>([\s\S]*?)<\/div>/);
          if (innerMatch) {
            buttonsHtml = innerMatch[1].trim();
          }
        }

        const replacement = `<${navComp}>\n          ${buttonsHtml}\n        </${navComp}>`;
        content = content.replace(navRegex, replacement);

        // Add import
        const importStatement = `import ${navComp} from '../../components/${navComp}';\n`;
        if (!content.includes(importStatement)) {
          // insert after react imports
          content = content.replace(/(import .*?from 'react[^']*';\n)/, `$1${importStatement}`);
          // if it didn't replace because there's no react import
          if (!content.includes(importStatement)) {
            content = importStatement + content;
          }
        }

        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(srcDir);
