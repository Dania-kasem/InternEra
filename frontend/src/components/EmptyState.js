import { useNavigate } from 'react-router-dom';
import { getTheme } from '../theme';
import { useTheme } from '../context/ThemeContext';

/**
 * Reusable EmptyState component for dashboards.
 * 
 * Props:
 *   icon      — emoji or icon string (e.g. "📋")
 *   title     — main heading (e.g. "No applications yet")
 *   message   — supporting description text
 *   btnLabel  — CTA button text (optional)
 *   btnPath   — route to navigate to on CTA click (optional)
 *   onAction  — custom click handler, overrides btnPath (optional)
 */
export default function EmptyState({ icon = '📭', title, message, btnLabel, btnPath, onAction }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 40px 60px',
      animation: 'fadeUp 0.4s ease forwards',
    }}>
      <div style={{
        width: '88px', height: '88px', borderRadius: '24px',
        background: isDark ? 'rgba(99,179,237,0.06)' : 'rgba(43,108,176,0.06)',
        border: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '40px', margin: '0 auto 24px',
      }}>
        {icon}
      </div>
      <h3 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '22px',
        color: t.textPrimary,
        marginBottom: '10px',
        fontWeight: 400,
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '14px',
        color: t.textMuted,
        lineHeight: '1.7',
        maxWidth: '360px',
        margin: '0 auto',
      }}>
        {message}
      </p>
      {btnLabel && (
        <button
          onClick={onAction || (() => navigate(btnPath))}
          style={{
            marginTop: '28px',
            padding: '12px 28px',
            borderRadius: '10px',
            background: isDark ? '#2b6cb0' : '#1a3a5c',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Sora', sans-serif",
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseOver={e => e.target.style.transform = 'translateY(-1px)'}
          onMouseOut={e => e.target.style.transform = 'translateY(0)'}
        >
          {btnLabel}
        </button>
      )}
    </div>
  );
}
