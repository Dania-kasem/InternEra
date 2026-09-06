import ThemeToggle from './ThemeToggle';

export default function MainNavbar({ onGetStarted }) {
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#1a2e42', fontWeight: 700 }}>Intern</span>
        <span style={{ color: '#2b6cb0', fontStyle: 'italic' }}>Era</span>
      </div>
      <div className="nav-links">
        <button className="nav-link" onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })}>How it works</button>
        <button className="nav-link" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Features</button>
        <button className="nav-link" onClick={() => document.getElementById('roles').scrollIntoView({ behavior: 'smooth' })}>For you</button>
        <button className="nav-link" onClick={() => document.getElementById('faq').scrollIntoView({ behavior: 'smooth' })}>FAQ</button>
        <button className="nav-btn" onClick={onGetStarted}>Get Started</button>
        <ThemeToggle />
      </div>
    </nav>
  );
}
