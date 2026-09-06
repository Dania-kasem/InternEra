const fs = require('fs');
const path = require('path');

const filesToFix = [
  path.join(__dirname, 'src', 'pages', 'student', 'StudentLogin.js'),
  path.join(__dirname, 'src', 'pages', 'student', 'StudentRegister.js'),
  path.join(__dirname, 'src', 'pages', 'company', 'CompanyLogin.js'),
  path.join(__dirname, 'src', 'pages', 'company', 'CompanyRegister.js'),
];

for (const file of filesToFix) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Inject t if missing
  if (!content.includes('const t = getTheme(isDark);')) {
    content = content.replace('const { isDark } = useTheme();', 'const { isDark } = useTheme();\n  const t = getTheme(isDark);');
  }
  if (!content.includes('getTheme')) {
    content = content.replace(/import \{ globalStyles \} from '\.\.\/\.\.\/theme';/g, "import { globalStyles, getTheme } from '../../theme';");
  }

  // --- Styles String Replacements ---
  content = content.replace(/color: #e8eaf6/g, 'color: ${t.textPrimary}');
  content = content.replace(/color: #1e2a3a/g, 'color: ${t.textPrimary}');
  content = content.replace(/color: #1a3a5c/g, 'color: ${t.textPrimary}');
  content = content.replace(/color: #4a5568/g, 'color: ${t.textMuted}');
  content = content.replace(/color: #718096/g, 'color: ${t.textSecondary}');
  content = content.replace(/color: #4a6080/g, 'color: ${t.textSecondary}');
  content = content.replace(/color: #63b3ed/g, 'color: ${t.accentLight}');
  content = content.replace(/color: #2b6cb0/g, 'color: ${t.accent}');
  content = content.replace(/background: rgba\(43,108,176,0\.15\)/g, 'background: ${t.accentMuted}');
  content = content.replace(/background: rgba\(255,255,255,0\.02\)/g, 'background: ${t.sidebarBg}');
  content = content.replace(/border-left: 1px solid rgba\(99,179,237,0\.08\)/g, 'border-left: 1px solid ${t.border}');
  content = content.replace(/border: 1px solid rgba\(99,179,237,0\.15\)/g, 'border: 1px solid ${t.borderHover}');
  content = content.replace(/background: rgba\(99,179,237,0\.1\)/g, 'background: ${t.accentMuted}');
  content = content.replace(/color: #3182ce/g, 'color: ${t.accentLight}');

  // --- Inline Styles Replacements ---
  content = content.replace(/color: '#4a5568'/g, 'color: t.textMuted');
  content = content.replace(/color: '#63b3ed'/g, 'color: t.accentLight');
  content = content.replace(/color: '#e8eaf6'/g, 'color: t.textPrimary');
  content = content.replace(/color: '#1e2a3a'/g, 'color: t.textPrimary');
  content = content.replace(/color: '#718096'/g, 'color: t.textSecondary');

  fs.writeFileSync(file, content);
  console.log('Fixed ' + path.basename(file));
}
