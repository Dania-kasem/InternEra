import { getTheme, globalStyles } from '../../theme';

export const getAdminCss = (isDark = true) => {
  const t = getTheme(isDark);
  const accentStrong = isDark ? '#90cdf4' : '#1e40af';
  const openBadgeBg = isDark ? 'rgba(99,179,237,0.12)' : 'rgba(37,99,235,0.16)';
  return `
    ${globalStyles(isDark)}
    
    .admin-page {
      min-height: 100vh; background: ${t.bg}; color: ${t.textPrimary};
      font-family: 'Sora', sans-serif; position: relative; overflow-x: hidden;
      padding-top: 70px;
    }
    .admin-bg {
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background: ${isDark
      ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(43,108,176,0.12) 0%, transparent 60%), #0a0f1e'
      : 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(37,99,235,0.06) 0%, transparent 60%), #f0f4f8'};
    }
    .admin-grid {
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image:
        linear-gradient(${isDark ? 'rgba(99,179,237,0.03)' : 'rgba(59,130,246,0.08)'} 1px, transparent 1px),
        linear-gradient(90deg, ${isDark ? 'rgba(99,179,237,0.03)' : 'rgba(59,130,246,0.08)'} 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .admin-layout { display: flex; min-height: calc(100vh - 70px); position: relative; z-index: 1; }

    /* ── Sidebar ── */
    .admin-sidebar {
      width: 240px; flex-shrink: 0;
      background: ${t.bgCard}; backdrop-filter: blur(12px);
      border-right: 1px solid ${t.border};
      padding: 32px 20px;
      position: fixed; top: 70px; bottom: 0; left: 0;
      display: flex; flex-direction: column; overflow-y: auto;
    }
    .admin-avatar {
      width: 44px; height: 44px; border-radius: 12px;
      background: ${t.accentMuted}; border: 1px solid ${t.border};
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; margin-bottom: 12px;
    }
    .admin-name { font-size: 14px; font-weight: 600; color: ${t.textPrimary}; margin-bottom: 2px; }
    .admin-role { font-size: 11px; color: ${t.textMuted}; margin-bottom: 28px; letter-spacing: 0.3px; }
    .sidebar-label {
      font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
      color: ${t.textMuted}; margin-bottom: 8px; padding: 0 12px;
    }
    .sidebar-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 10px; margin-bottom: 2px;
      cursor: pointer; font-size: 14px; color: ${t.textSecondary};
      transition: all 0.2s; border: none; background: none;
      width: 100%; text-align: left; font-family: 'Sora', sans-serif;
    }
    .sidebar-item:hover { background: ${t.bgCardHover}; color: ${t.textPrimary}; }
    .sidebar-item.active { background: ${t.accentMuted}; color: ${accentStrong}; font-weight: 600; }
    .sidebar-icon { font-size: 16px; width: 20px; text-align: center; }
    .logout-btn {
      width: 100%; padding: 10px 12px; border-radius: 10px;
      background: none; border: 1px solid rgba(252,129,129,0.2);
      color: #fc8181; font-size: 13px; font-family: 'Sora', sans-serif;
      cursor: pointer; margin-top: auto; transition: all 0.2s; text-align: left;
    }
    .logout-btn:hover { background: rgba(252,129,129,0.08); }

    /* ── Main area ── */
    .admin-main { flex: 1; margin-left: 240px; padding: 48px; min-height: calc(100vh - 70px); }
    .dash-greeting {
      font-family: 'DM Serif Display', serif; font-size: 32px;
      color: ${t.textPrimary}; margin-bottom: 6px;
    }
    .dash-greeting span { color: ${t.accentLight}; font-style: italic; }
    .dash-sub { font-size: 14px; color: ${t.textMuted}; margin-bottom: 32px; }

    /* ── Search & Filters ── */
    .search-input {
      width: 100%; padding: 12px 16px; border-radius: 12px;
      background: ${t.inputBg}; border: 1px solid ${t.inputBorder};
      color: ${t.textPrimary}; font-size: 14px; font-family: 'Sora', sans-serif;
      outline: none; margin-bottom: 16px; backdrop-filter: blur(8px);
      transition: border-color 0.2s;
    }
    .search-input::placeholder { color: ${t.textMuted}; }
    .search-input:focus { border-color: ${t.accentLight}; }
    .filter-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px; }
    .filter-btn {
      padding: 8px 18px; border-radius: 100px; border: 1px solid ${t.border};
      background: ${t.bgCard}; color: ${t.textSecondary}; font-size: 13px;
      font-family: 'Sora', sans-serif; cursor: pointer; transition: all 0.2s;
    }
    .filter-btn:hover { border-color: ${t.borderHover}; color: ${t.textPrimary}; }
    .filter-btn.active {
      background: ${t.accentMuted}; color: ${accentStrong};
      border-color: ${t.accentLight}; font-weight: 600;
    }

    /* ── Table ── */
    .table-wrapper {
      background: ${t.bgCard}; border: 1px solid ${t.border};
      border-radius: 16px; overflow: hidden; backdrop-filter: blur(8px);
    }
    .ie-table { width: 100%; border-collapse: collapse; }
    .ie-table thead tr { background: ${isDark ? 'rgba(15,23,42,0.5)' : '#f1f5f9'}; }
    .ie-table th {
      padding: 14px 20px; text-align: left; font-size: 11px; font-weight: 700;
      letter-spacing: 1px; text-transform: uppercase; color: ${t.textMuted};
      border-bottom: 1px solid ${t.border};
    }
    .ie-table td {
      padding: 16px 20px; font-size: 14px; color: ${t.textPrimary};
      border-bottom: 1px solid ${t.border};
    }
    .ie-table tbody tr:last-child td { border-bottom: none; }
    .ie-table tbody tr:hover td { background: ${t.bgCardHover}; }
    .empty-cell { text-align: center; color: ${t.textMuted}; padding: 48px !important; }

    /* ── Badges ── */
    .badge {
      padding: 4px 12px; border-radius: 100px; font-size: 11px;
      font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
      display: inline-block;
    }
    .badge-approved { background: rgba(72,187,120,0.12); color: #68d391; }
    .badge-accepted { background: rgba(72,187,120,0.12); color: #68d391; }
    .badge-pending  { background: rgba(246,173,85,0.12);  color: #f6ad55; }
    .badge-rejected { background: rgba(252,129,129,0.12); color: #fc8181; }
    .badge-open     { background: ${openBadgeBg};  color: ${accentStrong}; }
    .badge-closed   { background: rgba(100,116,139,0.12); color: #94a3b8; }

    /* ── Action Buttons ── */
    .action-btn {
      padding: 6px 14px; border-radius: 8px; font-size: 12px;
      font-family: 'Sora', sans-serif; font-weight: 600;
      cursor: pointer; border: none; margin-right: 6px; transition: all 0.2s;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .btn-approve { background: rgba(72,187,120,0.12); color: #68d391; border: 1px solid rgba(72,187,120,0.2); }
    .btn-approve:hover { background: rgba(72,187,120,0.2); }
    .btn-reject  { background: rgba(252,129,129,0.12); color: #fc8181; border: 1px solid rgba(252,129,129,0.2); }
    .btn-reject:hover  { background: rgba(252,129,129,0.2); }
    .btn-delete  { background: rgba(252,129,129,0.08); color: #fc8181; border: 1px solid rgba(252,129,129,0.15); }
    .btn-delete:hover  { background: rgba(252,129,129,0.18); }

    /* ── Stat Cards (Dashboard) ── */
    .stat-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px; margin-bottom: 40px;
    }
    .stat-card {
      background: ${t.bgCard}; border: 1px solid ${t.border};
      border-radius: 16px; padding: 24px; backdrop-filter: blur(8px);
      transition: border-color 0.2s, transform 0.2s;
    }
    .stat-card:hover { border-color: ${t.borderHover}; transform: translateY(-2px); }
    .stat-card-label { font-size: 12px; color: ${t.textMuted}; margin-bottom: 10px; font-weight: 600; letter-spacing: 0.3px; }
    .stat-card-value { font-size: 30px; font-weight: 700; margin-bottom: 4px; color: ${t.textPrimary}; }
    .stat-card-sub { font-size: 12px; color: ${t.textMuted}; }

    /* ── Quick Actions (Dashboard) ── */
    .quick-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }
    .quick-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: 10px;
      background: ${t.bgCard}; border: 1px solid ${t.border};
      color: ${t.textPrimary}; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; font-family: 'Sora', sans-serif;
      backdrop-filter: blur(8px);
    }
    .quick-btn:hover { border-color: ${t.borderHover}; background: ${t.bgCardHover}; }
  `;
};
