export const getTheme = (isDark = true) => ({
  bg: isDark ? '#0a0f1e' : '#f7f9fc',
  bgCard: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
  bgCardHover: isDark ? 'rgba(255,255,255,0.06)' : '#f0f4f8',
  border: isDark ? 'rgba(99,179,237,0.1)' : '#e2e8f0',
  borderHover: isDark ? 'rgba(99,179,237,0.25)' : '#cbd5e1',
  accent: isDark ? '#2b6cb0' : '#2b6cb0',
  accentHover: isDark ? '#2c5282' : '#1d4ed8',
  accentLight: isDark ? '#63b3ed' : '#3b82f6',
  accentMuted: isDark ? 'rgba(43,108,176,0.15)' : '#eff6ff',
  textPrimary: isDark ? '#e8eaf6' : '#334155',
  textSecondary: isDark ? '#718096' : '#475569',
  textMuted: isDark ? '#4a5568' : '#64748b',
  navBg: isDark ? 'rgba(10,15,30,0.9)' : 'rgba(247,249,252,0.92)',
  navBorder: isDark ? 'rgba(99,179,237,0.08)' : '#e2e8f0',
  inputBg: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
  inputBorder: isDark ? 'rgba(99,179,237,0.15)' : '#cbd5e1',
  sidebarBg: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
  success: '#48bb78',
  error: '#fc8181',
  warning: '#f6ad55',
});

export const globalStyles = (isDark = true) => {
  const t = getTheme(isDark);
  return `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Sora', sans-serif;
    background: ${t.bg};
    color: ${t.textPrimary};
    min-height: 100vh;
    transition: background 0.3s, color 0.3s;
  }
  input, textarea, select { font-family: 'Sora', sans-serif; }
  a { text-decoration: none; }

  .ie-page {
    min-height: 100vh;
    background: ${t.bg};
    position: relative;
    overflow-x: hidden;
    transition: background 0.3s;
  }
  .ie-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: ${isDark
      ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(43,108,176,0.12) 0%, transparent 60%), #0a0f1e'
      : 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(37,99,235,0.06) 0%, transparent 60%), #f0f4f8'};
  }
  .ie-grid {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(${isDark ? 'rgba(99,179,237,0.03)' : 'rgba(59,130,246,0.08)'} 1px, transparent 1px),
      linear-gradient(90deg, ${isDark ? 'rgba(99,179,237,0.03)' : 'rgba(59,130,246,0.08)'} 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .ie-content { position: relative; z-index: 1; }

  .ie-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 48px;
    background: ${t.navBg};
    backdrop-filter: blur(12px);
    border-bottom: 1px solid ${t.navBorder};
    transition: background 0.3s, border-color 0.3s;
  }
  .ie-nav-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    font-weight: 400;
    cursor: pointer;
    display: flex;
    align-items: center;
    line-height: 1;
  }
  .ie-nav-logo .intern { color: ${isDark ? '#e8eaf6' : '#1a2e42'}; font-weight: 700; }
  .ie-nav-logo .era { color: ${isDark ? '#63b3ed' : '#2b6cb0'}; font-style: italic; }

  .theme-toggle {
    background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(26,58,92,0.06)'};
    border: 1px solid ${t.border};
    border-radius: 100px; padding: 7px 16px;
    cursor: pointer; font-size: 13px; font-family: 'Sora', sans-serif;
    color: ${t.textSecondary}; transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
  }
  .theme-toggle:hover { border-color: ${t.borderHover}; color: ${t.textPrimary}; }

  .ie-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 28px; border-radius: 10px;
    font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 600;
    border: none; cursor: pointer; transition: all 0.2s;
  }
  .ie-btn-primary { background: ${t.accent}; color: #fff; }
  .ie-btn-primary:hover { background: ${t.accentHover}; transform: translateY(-1px); }
  .ie-btn-primary:disabled { background: ${isDark ? '#2d3748' : '#cbd5e1'}; color: ${isDark ? '#4a5568' : '#94a3b8'}; cursor: not-allowed; transform: none; }
  .ie-btn-ghost {
    background: transparent; color: ${t.accentLight};
    border: 1px solid ${isDark ? 'rgba(99,179,237,0.25)' : '#b8d0e8'};
  }
  .ie-btn-ghost:hover { border-color: ${t.accentLight}; background: ${isDark ? 'rgba(99,179,237,0.05)' : '#eff6ff'}; }

  .ie-input-group { margin-bottom: 20px; }
  .ie-label {
    display: block; font-size: 13px; font-weight: 600;
    color: ${t.textSecondary}; margin-bottom: 8px; letter-spacing: 0.3px;
  }
  .ie-input {
    width: 100%; padding: 13px 16px;
    background: ${t.inputBg};
    border: 1px solid ${t.inputBorder};
    border-radius: 10px; color: ${t.textPrimary};
    font-family: 'Sora', sans-serif; font-size: 15px;
    transition: border-color 0.2s, background 0.2s; outline: none;
  }
  .ie-input:focus { border-color: ${t.accentLight}; background: ${isDark ? 'rgba(99,179,237,0.05)' : '#eff6ff'}; }
  .ie-input::placeholder { color: ${t.textMuted}; }

  .ie-card {
    background: ${t.bgCard}; border: 1px solid ${t.border};
    border-radius: 20px; padding: 40px;
    transition: background 0.3s, border-color 0.3s;
  }

  .ie-badge {
    display: inline-block;
    background: ${isDark ? 'rgba(43,108,176,0.15)' : '#dbeafe'};
    border: 1px solid ${isDark ? 'rgba(99,179,237,0.2)' : '#93c5fd'};
    color: ${isDark ? '#90cdf4' : '#1d4ed8'}; font-size: 11px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase;
    padding: 5px 14px; border-radius: 100px;
  }

  .ie-error {
    background: rgba(252,129,129,0.1); border: 1px solid rgba(252,129,129,0.2);
    color: #fc8181; font-size: 14px; padding: 12px 16px; border-radius: 10px; margin-bottom: 20px;
  }
  .ie-success {
    background: rgba(72,187,120,0.1); border: 1px solid rgba(72,187,120,0.2);
    color: #48bb78; font-size: 14px; padding: 12px 16px; border-radius: 10px; margin-bottom: 20px;
  }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .ie-animate { animation: fadeUp 0.5s ease forwards; }
  .ie-animate-2 { animation: fadeUp 0.5s 0.1s ease both; }
  .ie-animate-3 { animation: fadeUp 0.5s 0.2s ease both; }
  .ie-animate-4 { animation: fadeUp 0.5s 0.3s ease both; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .ie-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff;
    animation: spin 0.7s linear infinite; display: inline-block;
  }
`};
