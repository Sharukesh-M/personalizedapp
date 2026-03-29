import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, ArrowLeft, User, Shield } from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  return (
    <header className="app-header glass-panel" style={{ borderBottom: 'none', borderRadius: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!isHome && (
          <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowLeft size={20} />
          </button>
        )}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>SkillForge</h2>
        </Link>
      </div>
      <div>
        <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }} title="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
}
