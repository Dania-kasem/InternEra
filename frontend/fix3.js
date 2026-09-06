const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'student', 'Dashboard.js');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const t = getTheme(isDark);')) {
  content = content.replace('const { isDark } = useTheme();', 'const { isDark } = useTheme();\n  const t = getTheme(isDark);');
}
if (!content.includes('getTheme')) {
  content = content.replace("import { globalStyles, getTheme } from '../../theme';", "import { globalStyles, getTheme } from '../../theme';");
}

content = content.replace(/rgba\(43,108,176,0\.2\)/g, '${t.accentMuted}');
content = content.replace(/color: #e8eaf6/g, 'color: ${t.textPrimary}');
content = content.replace(/color: #4a5568/g, 'color: ${t.textMuted}');
content = content.replace(/border: 1px solid rgba\(252,129,129,0\.15\)/g, 'border: 1px solid rgba(252,129,129,0.2)');
content = content.replace(/color: #363957/g, 'color: ${t.accentLight}');
content = content.replace(/background: rgba\(255,255,255,0\.03\)/g, 'background: ${t.bgCard}');
content = content.replace(/border: 1px solid rgba\(99,179,237,0\.1\)/g, 'border: 1px solid ${t.border}');
content = content.replace(/color: #4a41cf/g, 'color: ${t.textPrimary}');
content = content.replace(/color: #1a36d8/g, 'color: ${t.textPrimary}');
content = content.replace(/border: 1px solid rgba\(99,179,237,0\.08\)/g, 'border: 1px solid ${t.border}');
content = content.replace(/background: rgba\(255,255,255,0\.05\)/g, 'background: ${t.bgCardHover}');
content = content.replace(/border-color: rgba\(99,179,237,0\.2\)/g, 'border-color: ${t.borderHover}');
content = content.replace(/color: #06135ef6/g, 'color: ${t.textPrimary}');
content = content.replace(/color: #2d3748/g, 'color: ${t.textMuted}');
content = content.replace(/background: rgba\(43,108,176,0\.15\)/g, 'background: ${t.accentMuted}');
content = content.replace(/border: 1px solid rgba\(99,179,237,0\.15\)/g, 'border: 1px solid ${t.border}');
content = content.replace(/border-color: rgba\(99,179,237,0\.25\)/g, 'border-color: ${t.borderHover}');
content = content.replace(/background: rgba\(99,179,237,0\.06\)/g, 'background: ${t.bgCardHover}');

fs.writeFileSync(file, content);
console.log('Fixed Dashboard.js');
