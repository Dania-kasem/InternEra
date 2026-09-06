import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
