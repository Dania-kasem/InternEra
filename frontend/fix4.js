const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'LandingPage.js');
let content = fs.readFileSync(file, 'utf8');

// Replace Landing Page hardcoded light theme hex codes with t.* variables
// Using global replacements for exact known colors

content = content.replace(/rgba\(240,244,248,0\.92\)/g, '${t.navBg}');
content = content.replace(/#dde3ec/g, '${t.border}');
content = content.replace(/#1a3a5c/g, '${t.accentHover}');
content = content.replace(/#2b6cb0/g, '${t.accent}');
content = content.replace(/#4a6080/g, '${t.textSecondary}');
content = content.replace(/background: #fff/g, 'background: ${t.bgCard}');
content = content.replace(/color: #fff/g, 'color: #fff'); // Usually buttons, keep white
content = content.replace(/#e2e8f0/g, '${t.border}');
content = content.replace(/#f8fafc/g, '${t.bgCardHover}');
content = content.replace(/#1e2a3a/g, '${t.textPrimary}');
content = content.replace(/#7a90a8/g, '${t.textMuted}');
content = content.replace(/rgba\(255, 255, 255, 0\.9\)/g, '${isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)"}');
content = content.replace(/background: #f0f4f8/g, 'background: ${t.bg}');
content = content.replace(/rgba\(255, 255, 255, 0\.8\)/g, '${isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)"}');
content = content.replace(/background: #ffffff/g, 'background: ${t.bgCard}');

fs.writeFileSync(file, content);
console.log('Fixed LandingPage.js');
