import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';

function LandingPage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Sora', sans-serif; background: ${t.bg}; color: ${t.textPrimary}; overflow-x: hidden; transition: background 0.3s, color 0.3s; }

    /* ── NAV ── */
    .nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 60px;
      background: ${t.navBg};
      backdrop-filter: blur(14px);
      border-bottom: 1px solid ${t.navBorder};
    }
    .nav-logo {
      font-family: 'DM Serif Display', serif;
      font-size: 24px; color: ${t.textPrimary}; cursor: pointer;
      display: flex; align-items: center; gap: 10px;
    }
    .nav-logo-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #1a3a5c, #2b6cb0);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 18px; font-family: 'DM Serif Display', serif;
      font-style: italic;
    }
    .nav-logo span { color: #2b6cb0; font-style: italic; }
    .nav-links { display: flex; gap: 32px; align-items: center; }
    .nav-link {
      color: ${t.textSecondary}; font-size: 14px; font-weight: 500;
      text-decoration: none; transition: color 0.2s; cursor: pointer;
      background: none; border: none; font-family: 'Sora', sans-serif;
    }
    .nav-link:hover { color: ${t.accentLight}; }
    .nav-btn {
      background: #1a3a5c; color: #fff;
      padding: 9px 22px; border-radius: 8px;
      font-weight: 600; font-size: 14px; border: none;
      cursor: pointer; font-family: 'Sora', sans-serif;
      transition: background 0.2s;
    }
    .nav-btn:hover { background: #2b6cb0; }

    /* ── HERO ── */
    .hero {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; flex-direction: column;
      text-align: center; padding: 120px 40px 80px;
      background: ${isDark
        ? 'linear-gradient(160deg, #0d1b2e 0%, #0a0f1e 50%, #0d1525 100%)'
        : 'linear-gradient(160deg, #dce8f5 0%, #eaf1f8 50%, #d8e8f4 100%)'};
      position: relative; overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; inset: 0;
      background-image:
        linear-gradient(${isDark ? 'rgba(99,179,237,0.06)' : 'rgba(26,58,92,0.12)'} 1px, transparent 1px),
        linear-gradient(90deg, ${isDark ? 'rgba(99,179,237,0.06)' : 'rgba(26,58,92,0.12)'} 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .hero-content { position: relative; z-index: 1; max-width: 780px; }
    .hero-badge {
      display: inline-block; margin-bottom: 24px;
      background: ${isDark ? 'rgba(99,179,237,0.12)' : '#dde8f5'}; 
      border: 1px solid ${isDark ? 'rgba(99,179,237,0.3)' : '#b8d0e8'};
      color: ${isDark ? '#90cdf4' : '#1a3a5c'}; font-size: 11px; font-weight: 700;
      letter-spacing: 1.5px; padding: 6px 18px; border-radius: 100px;
      text-transform: uppercase;
    }
    .hero h1 {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(40px, 7vw, 72px);
      line-height: 1.1; color: ${t.textPrimary}; margin-bottom: 24px;
    }
    .hero h1 em { color: #2b6cb0; font-style: italic; }
    .hero p {
      font-size: 18px; color: ${t.textSecondary}; line-height: 1.7;
      max-width: 540px; margin: 0 auto 40px;
    }
    .hero-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      background: #1a3a5c; color: #fff;
      padding: 14px 32px; border-radius: 10px;
      font-size: 15px; font-weight: 600; border: none;
      cursor: pointer; font-family: 'Sora', sans-serif;
      transition: all 0.2s;
    }
    .btn-primary:hover { background: #2b6cb0; transform: translateY(-1px); }
    .btn-secondary {
      background: ${isDark ? 'rgba(255,255,255,0.05)' : '#fff'}; 
      color: ${isDark ? '#90cdf4' : '#1a3a5c'};
      padding: 14px 32px; border-radius: 10px;
      font-size: 15px; font-weight: 600;
      border: 1px solid ${isDark ? 'rgba(99,179,237,0.3)' : '#b8d0e8'};
      cursor: pointer; font-family: 'Sora', sans-serif;
      transition: all 0.2s;
    }
    .btn-secondary:hover { border-color: ${t.accentLight}; color: ${t.accentLight}; transform: translateY(-1px); }

    /* ── STATS ── */
    .stats-row {
      display: flex; gap: 0; justify-content: center;
      margin-top: 64px; background: ${isDark ? 'rgba(255,255,255,0.05)' : '#ffffff'};
      border-radius: 16px; border: 1px solid ${isDark ? 'rgba(99,179,237,0.12)' : '#dde3ec'};
      overflow: hidden;
    }
    .stat-item {
      flex: 1; text-align: center; padding: 24px 32px;
      border-right: 1px solid ${isDark ? 'rgba(99,179,237,0.1)' : '#dde3ec'};
    }
    .stat-item:last-child { border-right: none; }
    .stat-number { font-size: 32px; font-weight: 700; color: ${isDark ? '#90cdf4' : '#1a3a5c'}; }
    .stat-label { font-size: 13px; color: ${isDark ? '#718096' : '#7a90a8'}; margin-top: 4px; }

    /* ── SECTIONS ── */
    .section { padding: 100px 60px; max-width: 1200px; margin: 0 auto; }
    .section-tag {
      font-size: 11px; font-weight: 700; letter-spacing: 2px;
      text-transform: uppercase; color: ${t.accentLight}; margin-bottom: 12px;
    }
    .section-title {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(28px, 4vw, 48px);
      color: ${isDark ? '#e8eaf6' : '#1e2a3a'}; margin-bottom: 14px; line-height: 1.15;
    }
    .section-sub { font-size: 16px; color: ${isDark ? '#718096' : '#7a90a8'}; max-width: 480px; line-height: 1.7; }

    /* ── HOW IT WORKS ── */
    .hiw-wrap {
      background: ${isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'}; border-radius: 24px;
      border: 1px solid ${isDark ? 'rgba(99,179,237,0.1)' : '#dde3ec'}; padding: 60px;
      margin: 0 60px;
    }
    .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; margin-top: 48px; position: relative; }
    .steps::before {
      content: ''; position: absolute; top: 28px; left: 10%; right: 10%;
      height: 1px; background: ${isDark ? 'rgba(99,179,237,0.1)' : '#dde3ec'}; z-index: 0;
    }
    .step { text-align: center; position: relative; z-index: 1; }
    .step-num {
      width: 56px; height: 56px; border-radius: 50%;
      background: #1a3a5c; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700; margin: 0 auto 16px;
      border: 4px solid ${isDark ? '#0a0f1e' : '#f0f4f8'};
    }
    .step h3 { font-size: 16px; font-weight: 600; color: ${isDark ? '#e8eaf6' : '#1e2a3a'}; margin-bottom: 8px; }
    .step p { font-size: 13px; color: ${isDark ? '#718096' : '#7a90a8'}; line-height: 1.6; }

    /* ── AI SECTION ── */
    .ai-section {
      background: linear-gradient(135deg, #1a3a5c 0%, #2b6cb0 100%);
      border-radius: 24px; padding: 60px; margin: 0 60px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
    }
    .ai-text h2 {
      font-family: 'DM Serif Display', serif;
      font-size: 36px; color: #fff; margin-bottom: 16px;
    }
    .ai-text p { font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.7; margin-bottom: 24px; }
    .ai-steps { display: flex; flex-direction: column; gap: 16px; }
    .ai-step {
      display: flex; gap: 14px; align-items: flex-start;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px; padding: 16px;
    }
    .ai-step-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }
    .ai-step-text h4 { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px; }
    .ai-step-text p { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.5; }
    .ai-badge {
      display: inline-block; background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff; font-size: 11px; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase;
      padding: 5px 14px; border-radius: 100px; margin-bottom: 16px;
    }

    /* ── FEATURES ── */
    .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
    .feature-card {
      background: ${isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'}; border: 1px solid ${isDark ? 'rgba(99,179,237,0.1)' : '#dde3ec'};
      border-radius: 16px; padding: 28px;
      transition: all 0.2s;
    }
    .feature-card:hover { border-color: #2b6cb0; transform: translateY(-2px); box-shadow: 0 8px 24px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(26,58,92,0.08)'}; }
    .feature-icon {
      width: 48px; height: 48px; border-radius: 12px;
      background: ${isDark ? 'rgba(43,108,176,0.2)' : '#dde8f5'}; display: flex; align-items: center;
      justify-content: center; font-size: 22px; margin-bottom: 16px;
    }
    .feature-card h3 { font-size: 16px; font-weight: 600; color: ${isDark ? '#e8eaf6' : '#1e2a3a'}; margin-bottom: 8px; }
    .feature-card p { font-size: 13px; color: ${isDark ? '#718096' : '#7a90a8'}; line-height: 1.7; }

    /* ── TESTIMONIALS ── */
    .testimonials-bg { background: ${isDark ? '#080d1a' : '#ffffff'}; padding: 100px 0; }
    .testimonials { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
    .testimonial-card {
      background: ${isDark ? 'rgba(255,255,255,0.03)' : '#f7fafc'}; border: 1px solid ${isDark ? 'rgba(99,179,237,0.1)' : '#dde3ec'};
      border-radius: 16px; padding: 28px;
    }
    .testimonial-quote { font-size: 14px; color: ${isDark ? '#94a3b8' : '#4a6080'}; line-height: 1.8; margin-bottom: 20px; font-style: italic; }
    .testimonial-author { display: flex; align-items: center; gap: 12px; }
    .author-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #1a3a5c, #2b6cb0);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 14px;
    }
    .author-name { font-size: 14px; font-weight: 600; color: ${isDark ? '#e8eaf6' : '#1e2a3a'}; }
    .author-role { font-size: 12px; color: #7a90a8; }
    .stars { color: #f6ad55; font-size: 13px; margin-bottom: 12px; }

    /* ── ROLES ── */
    .roles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
    .role-card {
      background: ${isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'}; border: 1px solid ${isDark ? 'rgba(99,179,237,0.1)' : '#dde3ec'};
      border-radius: 20px; padding: 36px 28px;
      text-align: center; transition: all 0.2s;
      display: flex; flex-direction: column;
    }
    .role-card:hover { border-color: #2b6cb0; box-shadow: 0 8px 24px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(26,58,92,0.08)'}; }
    .role-emoji { font-size: 40px; margin-bottom: 16px; }
    .role-card h3 { font-size: 20px; font-weight: 600; color: ${isDark ? '#e8eaf6' : '#1e2a3a'}; margin-bottom: 10px; }
    .role-card p { font-size: 14px; color: ${isDark ? '#718096' : '#7a90a8'}; line-height: 1.7; margin-bottom: 20px; }
    .role-list { list-style: none; text-align: left; flex: 1; }
    .role-list li {
      font-size: 13px; color: ${isDark ? '#94a3b8' : '#4a6080'}; padding: 7px 0;
      border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f0f4f8'};
      display: flex; align-items: center; gap: 8px;
    }
    .role-list li:last-child { border: none; }
    .role-list li::before { content: '→'; color: ${t.accentLight}; font-size: 12px; }
    .role-btn-wrap { margin-top: 24px; }
    .role-btn {
      width: 100%; padding: 12px; border-radius: 10px;
      background: #1a3a5c; color: #fff;
      font-size: 14px; font-weight: 600; border: none;
      cursor: pointer; font-family: 'Sora', sans-serif;
      transition: background 0.2s;
    }
    .role-btn:hover { background: ${t.accentHover}; }

    /* ── FAQ ── */
    .faq-wrap { max-width: 700px; margin: 48px auto 0; }
    .faq-item {
      background: ${isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'}; border: 1px solid ${isDark ? 'rgba(99,179,237,0.1)' : '#dde3ec'};
      border-radius: 12px; margin-bottom: 12px; overflow: hidden;
    }
    .faq-q {
      width: 100%; padding: 18px 24px;
      display: flex; justify-content: space-between; align-items: center;
      background: none; border: none; cursor: pointer;
      font-family: 'Sora', sans-serif; font-size: 15px;
      font-weight: 600; color: ${isDark ? '#e8eaf6' : '#1e2a3a'}; text-align: left;
      transition: background 0.2s;
    }
    .faq-q:hover { background: ${isDark ? 'rgba(255,255,255,0.04)' : '#f7fafc'}; }
    .faq-icon { color: ${t.accentLight}; font-size: 18px; flex-shrink: 0; }
    .faq-a { padding: 0 24px 18px; font-size: 14px; color: ${isDark ? '#94a3b8' : '#7a90a8'}; line-height: 1.7; }

    /* ── CTA ── */
    .cta-section {
      text-align: center; padding: 80px 40px;
      background: linear-gradient(135deg, #1a3a5c 0%, #2b6cb0 100%);
      border-radius: 24px; margin: 0 60px 100px;
    }
    .cta-section h2 {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(28px, 4vw, 44px); color: #fff; margin-bottom: 12px;
    }
    .cta-section p { font-size: 16px; color: rgba(255,255,255,0.85); margin-bottom: 32px; }
    .cta-btn-primary {
      background: #fff; color: #1a3a5c;
      padding: 14px 32px; border-radius: 10px;
      font-size: 15px; font-weight: 600; border: none;
      cursor: pointer; font-family: 'Sora', sans-serif;
      transition: all 0.2s; margin: 0 8px;
    }
    .cta-btn-primary:hover { background: #f0f4f8; }
    .cta-btn-secondary {
      background: transparent; color: #fff;
      padding: 14px 32px; border-radius: 10px;
      font-size: 15px; font-weight: 600;
      border: 1px solid rgba(255,255,255,0.4);
      cursor: pointer; font-family: 'Sora', sans-serif;
      transition: all 0.2s; margin: 0 8px;
    }
    .cta-btn-secondary:hover { border-color: #fff; }

    /* ── FOOTER ── */
    footer {
      background: #1a3a5c; color: rgba(255,255,255,0.6);
      padding: 40px 60px;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 16px;
    }
    .footer-logo {
      font-family: 'DM Serif Display', serif;
      font-size: 20px; color: #fff;
      display: flex; align-items: center; gap: 8px;
    }

    /* ── MODAL ── */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(10,20,35,0.7);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 24px; backdrop-filter: blur(4px);
    }
    .modal-box {
      background: ${isDark ? '#0f1829' : '#ffffff'}; border-radius: 24px; padding: 48px 40px;
      max-width: 420px; width: 100%; text-align: center;
      box-shadow: 0 24px 64px rgba(10,20,35,0.15);
      border: 1px solid ${isDark ? 'rgba(99,179,237,0.12)' : 'transparent'};
    }
    .modal-emoji { font-size: 48px; margin-bottom: 16px; }
    .modal-title {
      font-family: 'DM Serif Display', serif;
      font-size: 28px; color: ${isDark ? '#e8eaf6' : '#1e2a3a'}; margin-bottom: 8px;
    }
    .modal-sub { font-size: 14px; color: ${isDark ? '#94a3b8' : '#7a90a8'}; margin-bottom: 32px; line-height: 1.6; }
    .modal-btn-new {
      width: 100%; padding: 14px; border-radius: 10px;
      background: #1a3a5c; color: #fff;
      font-size: 15px; font-weight: 600; border: none;
      cursor: pointer; font-family: 'Sora', sans-serif;
      transition: background 0.2s; margin-bottom: 12px;
    }
    .modal-btn-new:hover { background: #2b6cb0; }
    .modal-btn-existing {
      width: 100%; padding: 14px; border-radius: 10px;
      background: ${isDark ? 'rgba(255,255,255,0.05)' : '#ffffff'}; color: ${isDark ? '#90cdf4' : '#1a3a5c'};
      font-size: 15px; font-weight: 600;
      border: 1px solid ${isDark ? 'rgba(99,179,237,0.25)' : '#b8d0e8'};
      cursor: pointer; font-family: 'Sora', sans-serif;
      transition: all 0.2s; margin-bottom: 12px;
    }
    .modal-btn-existing:hover { border-color: #2b6cb0; color: #2b6cb0; }
    .modal-cancel {
      background: none; border: none; color: #7a90a8;
      cursor: pointer; font-size: 13px; font-family: 'Sora', sans-serif;
      margin-top: 4px;
    }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { opacity: 0; animation: fadeUp 0.6s ease forwards; }
    .fade-in:nth-child(2) { animation-delay: 0.1s; }
    .fade-in:nth-child(3) { animation-delay: 0.2s; }
    .fade-in:nth-child(4) { animation-delay: 0.3s; }
  `;

  const faqs = [
    { q: 'Is InternEra free for students?', a: 'Yes! InternEra is completely free for students. Create your account, upload your CV, and start applying to internships at no cost.' },
    { q: 'How does the AI matching work?', a: 'Our AI analyzes your CV to extract skills, education, and experience. It then compares these against internship requirements and gives each listing a match score from 0–100%.' },
    { q: 'How long does company verification take?', a: 'Company accounts are reviewed by our admin team within 24–48 hours. You will be notified by email once your account is approved.' },
    { q: 'Can I apply to multiple internships?', a: 'Absolutely! You can apply to as many internships as you like and track all your applications from your personal dashboard.' },
    { q: 'What file format does my CV need to be?', a: 'We currently accept PDF files only. Make sure your CV is up to date before uploading for the best AI analysis results.' },
  ];

  const testimonials = [
    { quote: 'InternEra helped me find a frontend internship in just two weeks. The AI match score showed me exactly which listings fit my skills.', name: 'Sara A.', role: 'IS Student, Yarmouk University', init: 'S' },
    { quote: 'As a company, we found qualified candidates much faster. The match score saved us hours of manual screening.', name: 'Rami K.', role: 'HR Manager, TechCo Jordan', init: 'R' },
    { quote: 'The AI rejection feedback told me exactly what skills I was missing. I improved my CV and got accepted on my next application!', name: 'Omar N.', role: 'CS Student, JUST', init: 'O' },
  ];

  return (
    <>
      <style>{styles}</style>

      {/* NAV */}
      <MainNavbar onGetStarted={() => setModal('entry')} />

      {/* HERO */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-badge fade-in">Yarmouk University · IS Project 2026</div>
          <h1 className="fade-in">
            Find your internship<br />with <em>AI-powered</em> matching
          </h1>
          <p className="fade-in">
            InternEra connects IT students with the right companies — using intelligent CV analysis and smart recommendations to make every application count.
          </p>
          <div className="hero-btns fade-in">
            <button className="btn-primary" onClick={() => setModal('entry')}>Get Started — it's free</button>
          </div>
          <div className="stats-row fade-in">
            <div className="stat-item">
              <div className="stat-number">AI</div>
              <div className="stat-label">CV Analysis</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">3</div>
              <div className="stat-label">User Roles</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Free for Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">0–100</div>
              <div className="stat-label">Match Scoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ padding: '100px 0' }}>
        <div className="section" style={{ textAlign: 'center', paddingBottom: '40px' }}>
          <div className="section-tag">Process</div>
          <h2 className="section-title">How InternEra works</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>From registration to landing your internship in four simple steps.</p>
        </div>
        <div className="hiw-wrap" id="how">
          <div className="steps">
            {[
              { n: '1', title: 'Create your profile', desc: 'Register as a student, fill in your academic info, major, and contact details.' },
              { n: '2', title: 'Upload your CV', desc: 'Our AI engine analyzes your CV and extracts your skills, experience, and education.' },
              { n: '3', title: 'Get matched', desc: 'Browse personalized internship recommendations that fit your skills and field of study.' },
              { n: '4', title: 'Apply & track', desc: 'Submit applications and monitor their status in your dashboard in real time.' },
            ].map(s => (
              <div className="step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI SECTION */}
      <div style={{ padding: '0 0 100px' }}>
        <div className="ai-section">
          <div className="ai-text">
            <div className="ai-badge">AI Powered</div>
            <h2>Intelligent CV analysis & matching</h2>
            <p>Our AI reads your CV, understands your skills, and matches you with the right internships — giving you a score and feedback to improve your chances.</p>
            <button className="cta-btn-primary" onClick={() => setModal('student')}>
              Try it free →
            </button>
          </div>
          <div className="ai-steps">
            {[
              { icon: '📄', title: 'CV Upload & Parsing', desc: 'Upload your PDF and our AI extracts skills, education, and experience automatically.' },
              { icon: '🎯', title: 'Smart Match Score', desc: 'Each internship gets a 0–100% match score based on how well your profile fits.' },
              { icon: '💡', title: 'AI Recommendations', desc: 'Get a personalized list of the best internships for your unique profile.' },
              { icon: '📝', title: 'Rejection Feedback', desc: 'If rejected, our AI explains why and suggests exactly how to improve.' },
            ].map(s => (
              <div className="ai-step" key={s.title}>
                <div className="ai-step-icon">{s.icon}</div>
                <div className="ai-step-text">
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background: isDark ? '#080d1a' : '#ffffff', padding: '100px 0' }}>
        <div className="section" id="features">
          <div className="section-tag">Features</div>
          <h2 className="section-title">Everything you need,<br />in one platform</h2>
          <div className="features">
            {[
              { icon: '🤖', title: 'AI CV Analysis', desc: 'Upload your PDF and our AI extracts your skills, education, and experience automatically using NLP.' },
              { icon: '🎯', title: 'Smart Matching', desc: 'Get a match score for each internship based on how well your CV aligns with requirements.' },
              { icon: '💬', title: 'In-App Messaging', desc: 'Students and companies can communicate directly through the platform after applying.' },
              { icon: '📊', title: 'Admin Reports', desc: 'Admins can monitor all activity and generate reports on students, companies, and applications.' },
              { icon: '🔒', title: 'Secure Auth', desc: 'JWT-based authentication with role-based access and account lockout after 5 failed attempts.' },
              { icon: '📝', title: 'AI Feedback', desc: "Rejected? Our AI explains why and suggests how to improve your CV for the next application." },
            ].map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="testimonials-bg">
        <div className="section">
          <div className="section-tag" style={{ textAlign: 'center' }}>Testimonials</div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>What people say</h2>
          <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto' }}>Real feedback from students and companies using InternEra.</p>
          <div className="testimonials">
            {testimonials.map(t => (
              <div className="testimonial-card" key={t.name}>
                <div className="stars">★★★★★</div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.init}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROLES */}
      <div style={{ background: isDark ? '#050810' : '#f7fafc', padding: '100px 0' }}>
        <div className="section" id="roles">
          <div className="section-tag">Roles</div>
          <h2 className="section-title">Built for everyone</h2>
          <p className="section-sub">Whether you're a student, a company, or an admin — InternEra has everything you need.</p>
          <div className="roles">
            {[
              {
                emoji: '🎓', title: 'Students', type: 'student',
                desc: 'Find and apply for internships that match your academic background and skills.',
                items: ['Search & filter internships', 'Upload & analyze your CV', 'Track applications', 'Save favorites to dashboard', 'Get AI recommendations'],
                label: 'Get Started as Student',
              },
              {
                emoji: '🏢', title: 'Companies', type: 'company',
                desc: 'Post internship opportunities and find the right candidates efficiently.',
                items: ['Post internship listings', 'Review student applications', 'View AI match scores', 'Accept or reject applicants', 'Message students directly'],
                label: 'Register your Company',
              },
              {
                emoji: '⚙️', title: 'Admins', type: 'admin',
                desc: 'Oversee the platform, manage accounts, and generate reports.',
                items: ['Approve student & company accounts', 'Monitor all applications', 'Generate activity reports', 'Manage platform data'],
                label: 'Admin Access',
              },
            ].map(r => (
              <div className="role-card" key={r.title}>
                <div className="role-emoji">{r.emoji}</div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
                <ul className="role-list">
                  {r.items.map(item => <li key={item}>{item}</li>)}
                </ul>
                <div className="role-btn-wrap">
                  <button className="role-btn"
                    onClick={() => r.type === 'admin' ? navigate('/login') : setModal('entry')}>
                    {r.label}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: isDark ? '#080d1a' : '#ffffff', padding: '100px 0' }}>
        <div className="section" id="faq" style={{ textAlign: 'center' }}>
          <div className="section-tag">FAQ</div>
          <h2 className="section-title">Frequently asked questions</h2>
          <p className="section-sub" style={{ margin: '0 auto 0' }}>Everything you need to know about InternEra.</p>
          <div className="faq-wrap">
            {faqs.map((f, i) => (
              <div className="faq-item" key={i}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <h2>Ready to find your internship?</h2>
        <p>Join InternEra and let AI do the heavy lifting for you.</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="cta-btn-primary" onClick={() => setModal('entry')}>Get Started — it's free</button>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo" style={{ fontSize: '24px' }}>
          <span style={{ fontWeight: 700 }}>Intern</span>
          <span style={{ fontStyle: 'italic', color: '#63b3ed' }}>Era</span>
        </div>
        <p>Yarmouk University · Information Systems · 2025–2026</p>
        <p>Built with React + FastAPI + Claude AI</p>
      </footer>

      {/* MODAL — Entry */}
      {modal === 'entry' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-emoji">👋</div>
            <h2 className="modal-title">Welcome to InternEra</h2>
            <p className="modal-sub">
              Do you already have an account?
            </p>
            <button className="modal-btn-existing"
              onClick={() => { navigate('/login'); setModal(null); }}>
              🔑 Yes — Sign In
            </button>
            <button className="modal-btn-new"
              onClick={() => setModal('register')}>
              🆕 No — Create Account
            </button>
            <button className="modal-cancel" onClick={() => setModal(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* MODAL — Role Selection for Registration */}
      {modal === 'register' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-emoji">📝</div>
            <h2 className="modal-title">Create an Account</h2>
            <p className="modal-sub">
              What describes you best?
            </p>
            <button className="modal-btn-new"
              onClick={() => { navigate('/student/register'); setModal(null); }}>
              🎓 I'm a Student
            </button>
            <button className="modal-btn-existing"
              onClick={() => { navigate('/company/register'); setModal(null); }}>
              🏢 I'm a Company
            </button>
            <button className="modal-cancel" onClick={() => setModal('entry')}>← Back</button>
          </div>
        </div>
      )}
    </>
  );
}

export default LandingPage;