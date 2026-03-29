import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { User, LogIn, Mail, KeyRound, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { supabase } from '../supabaseClient';

export default function Home() {
  const navigate = useNavigate();
  const { login, currentUser } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Flow States
  const [view, setView] = useState('login'); // 'login', 'forgot', 'verify', 'new-pass'
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [resetUser, setResetUser] = useState(null);

  // Auto redirect if already logged in as user
  if (currentUser?.role === 'user') {
    navigate('/user');
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const user = await login(username, password);
    setIsLoading(false);
    if (user) {
      if (user.role === 'admin') navigate('/admin-page');
      else navigate('/user');
    } else {
      setError('Invalid username or password');
    }
  };

  const requestPasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    // 1. Check if user exists looking up specifically by username
    const { data: dbUser, error: queryErr } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (queryErr || !dbUser || !dbUser.email) {
      setIsLoading(false);
      setError('User not found or no associated email. Contact Admin.');
      return;
    }

    // 2. Generate exactly a 6-digit random combination
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save officially to Supabase
    const { error: updateErr } = await supabase
      .from('users')
      .update({ resetCode: code })
      .eq('id', dbUser.id);

    if (updateErr) {
      setIsLoading(false);
      setError('Failed to initiate secure reset protocol on server.');
      return;
    }

    // 4. Dispatch Email physically via EmailJS!
    try {
      // NOTE TO ADMIN: Replace these 3 strings with your actual EmailJS keys!
      await emailjs.send(
        'service_bx4qqjp', 
        'template_35i7bee', 
        {
          to_name: dbUser.name,
          to_email: dbUser.email, 
          reset_code: code
        },
        'MjZaGWUts6gnAuuN8'
      );
      
      // We MUST explicitly merge the newly generated code into React state!
      setResetUser({ ...dbUser, resetCode: code });
      setView('verify');
      setSuccessMsg(`Secure code emailed to ${dbUser.email.replace(/(.{2})(.*)(?=@)/, "$1***")}!`);
    } catch (err) {
      console.error('Email Dispatch Failed:', err);
      setError('Failed to dispatch external email. Check EmailJS config.');
    }
    setIsLoading(false);
  };

  const verifyResetCode = (e) => {
    e.preventDefault();
    if (resetCodeInput.trim() === resetUser.resetCode) {
      setView('new-pass');
      setError('');
      setSuccessMsg('Identity securely verified! Enter your new password below.');
    } else {
      setError('Invalid digital access code. Try again.');
    }
  };

  const submitNewPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error: updateErr } = await supabase
      .from('users')
      .update({ pass: password, resetCode: null }) // explicitly delete the code for security
      .eq('id', resetUser.id);

    setIsLoading(false);
    
    if (updateErr) {
      setError('Server failed to securely persist the new password.');
    } else {
      setView('login');
      setSuccessMsg('Password physically reset! You can now securely log in.');
      setPassword('');
      setResetUser(null);
      setResetCodeInput('');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem' }}>
        
        {/* Render Form Icons Dynamically */}
        <div style={{ background: view === 'login' ? 'var(--accent-primary)' : 'var(--accent-warning)', color: view === 'login' ? 'white' : '#000', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
          {view === 'login' ? <User size={48} /> : view === 'forgot' ? <Mail size={48} /> : view === 'verify' ? <ShieldCheck size={48} /> : <KeyRound size={48} />}
        </div>
        
        <h2 style={{ marginBottom: '0.5rem' }}>
          {view === 'login' ? 'User Portal' : view === 'forgot' ? 'Forgot Password' : view === 'verify' ? 'Verify Identity' : 'Secure New Password'}
        </h2>
        
        <p style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {view === 'login' ? 'Login to access your daily tasks and reports.' : view === 'forgot' ? 'Enter your username to magically receive your digital reset code.' : view === 'verify' ? 'Enter the exact 6-digit code dispatched to your email address.' : 'Set your new secure password!'}
        </p>
        
        {error && <div style={{ width: '100%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}
        {successMsg && <div style={{ width: '100%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{successMsg}</div>}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Username</label>
              <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field" placeholder="Enter username..." />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Enter password..." style={{ width: '100%', paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
              <LogIn size={20} /> {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <button type="button" onClick={() => { setView('forgot'); setError(''); setSuccessMsg(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem', marginTop: '0.25rem', textDecoration: 'underline' }}>
              Forgot Password?
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD REQUEST VIEW */}
        {view === 'forgot' && (
          <form onSubmit={requestPasswordReset} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Enter Your Username</label>
              <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field" placeholder="e.g. shaikbasheera" />
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ backgroundColor: 'var(--accent-warning)', color: '#000', marginTop: '0.5rem', width: '100%', fontWeight: 'bold' }}>
              <Mail size={20} /> {isLoading ? 'Generating & Sending...' : 'Dispatch Email Code'}
            </button>
            <button type="button" onClick={() => setView('login')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={16}/> Back to Login
            </button>
          </form>
        )}

        {/* VERIFY CODE VIEW */}
        {view === 'verify' && (
          <form onSubmit={verifyResetCode} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Secret Dispatch Code</label>
              <input required type="text" value={resetCodeInput} onChange={e => setResetCodeInput(e.target.value)} className="input-field" placeholder="Enter 6-digit code..." style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '1.25rem' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-warning)', color: '#000', marginTop: '0.5rem', width: '100%', fontWeight: 'bold' }}>
              <ShieldCheck size={20} /> Verify Access
            </button>
            <button type="button" onClick={() => setView('login')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={16}/> Abort & Return
            </button>
          </form>
        )}

        {/* NEW PASSWORD VIEW */}
        {view === 'new-pass' && (
          <form onSubmit={submitNewPassword} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>New Secure Password</label>
              <div style={{ position: 'relative' }}>
                <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Type entirely new password..." style={{ width: '100%', paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ backgroundColor: 'var(--accent-success)', color: 'white', marginTop: '0.5rem', width: '100%', fontWeight: 'bold' }}>
              <KeyRound size={20} /> {isLoading ? 'Securing Profile...' : 'Finalize & Update Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
