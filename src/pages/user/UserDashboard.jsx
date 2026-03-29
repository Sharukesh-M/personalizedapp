import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Play, CheckCircle, Activity, Bell, Calendar, Edit, Target, Compass, Lock } from 'lucide-react';

export default function UserDashboard() {
  const { tasks, currentUser, logout, updateTask, updatePassword } = useData();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [showPwdUpdate, setShowPwdUpdate] = useState(false);

  const handlePwdUpdate = (e) => {
    e.preventDefault();
    if (newPassword.trim()) {
      updatePassword(currentUser.id, newPassword);
      setNewPassword('');
      setShowPwdUpdate(false);
      alert('Password updated successfully!');
    }
  };

  if (!currentUser || currentUser.role !== 'user') {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Please login as a User to view this page. <br/><button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Login</button></div>;
  }

  // Tasks assigned to this specific user dynamically
  const userTasks = tasks.filter(t => t.assignedTo === currentUser.id);
  
  const completed = userTasks.filter(t => t.status === 'completed').length;
  const total = userTasks.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const pendingTasks = userTasks.filter(t => t.status === 'pending');
  const pastSubmissions = userTasks.filter(t => t.status === 'completed');

  const [todoList, setTodoList] = useState([
    { id: 1, text: 'Review feedback from Admin', done: false },
    { id: 2, text: 'Check daily assignments', done: true }
  ]);

  const toggleTodo = (id) => {
    setTodoList(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '100%', alignItems: 'flex-start' }}>
      
      {/* Sidebar Profile / Stats / ToDo / Calendar */}
      <div className="card glass-panel" style={{ width: '320px', position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem', fontWeight: 'bold' }}>
            {currentUser.name.charAt(0)}
          </div>
          <h3 style={{ marginBottom: '0.25rem' }}>{currentUser.name}</h3>
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--accent-warning)', fontWeight: 600 }}>
            🔥 {currentUser.currentStreak} Day Streak
          </p>
          
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => setShowPwdUpdate(!showPwdUpdate)} className="btn btn-secondary" style={{ width: '100%', gap: '0.5rem', fontSize: '0.875rem' }}><Lock size={14}/> Change Password</button>
            {showPwdUpdate && (
              <form onSubmit={handlePwdUpdate} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }} />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Save</button>
              </form>
            )}
            <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary" style={{ width: '100%' }}>Logout</button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} /> Daily Progress
          </h4>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <span>{completed} / {total} Tasks</span>
            <span>{progress}%</span>
          </div>
          
          <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-success)', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Roadmap Link */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <Link to="/user/roadmap" className="btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', background: 'var(--accent-warning)', color: '#000', fontWeight: 'bold' }}>
            <Compass size={18} /> My Roadmap & Resources
          </Link>
        </div>

        {/* Simple Goal Calendar Visual */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--accent-danger)" />
            Task Deadline Calendar
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', justifyItems: 'center' }}>
            {[1,2,3,4,5,6,7, 8,9,10,11,12,13,14, 15,16,17,18,19,20,21, 22,23,24,25,26,27,28].map(day => {
              const hasDeadline = pendingTasks.some(t => t.dueDate && new Date(t.dueDate).getDate() === day);
              return (
              <div key={day} style={{ 
                width: '100%', aspectRatio: '1', borderRadius: '4px', 
                backgroundColor: hasDeadline ? 'var(--accent-danger)' : 'var(--bg-main)',
                border: hasDeadline ? 'none' : '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', color: hasDeadline ? 'white' : 'var(--text-muted)',
                fontWeight: hasDeadline ? 'bold' : 'normal'
              }}>
                {day}
              </div>
            )})}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>Dates highlighted red indicate a pending deadline.</p>
        </div>

      </div>

      {/* Main Task Feed */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Top Highlighted Goal */}
        <div className="card glass-panel" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, color: 'var(--text-main)' }}>
            <Target size={32} color="var(--accent-primary)" />
            <span>
              <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Assigned Goal Target</span>
              {currentUser.goal || 'No specific long-term goal defined yet!'}
            </span>
          </h2>
        </div>

        {/* Notifications / Daily Notice */}
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%)', color: 'white', border: 'none' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Bell size={24} /> Hello {currentUser.name}, you have {pendingTasks.length} things to do today!
          </h2>
        </div>

        <h3 style={{ margin: 0 }}>Pending Assigned Tasks</h3>
        {pendingTasks.length === 0 ? (
          <div className="card glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <CheckCircle size={48} color="var(--accent-success)" style={{ marginBottom: '1rem' }} />
            <h3>All Caught Up!</h3>
            <p>You have completed all your assigned tasks for today.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingTasks.map(task => (
               <div key={task.id} className="card glass-panel animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className="status-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)' }}>
                      {task.type.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Assigned on {task.date}</span>
                    {task.dueDate && (
                      <span style={{ fontSize: '0.875rem', color: 'var(--accent-danger)', fontWeight: 'bold' }}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 style={{ marginBottom: '0.5rem' }}>{task.title}</h3>
                  <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.description}
                  </p>
                </div>
                <div style={{ marginLeft: '2rem' }}>
                  <Link to={`/user/task/${task.id}`} className="btn btn-primary" style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}>
                    <Play size={18} fill="currentColor" /> Start Task
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {pastSubmissions.length > 0 && (
          <>
            <h3 style={{ margin: '1rem 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Recent Submissions 
              <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>(Click to modify)</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {pastSubmissions.map(task => (
                <div key={task.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--accent-success)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0 }}>{task.title}</h4>
                    <CheckCircle size={20} color="var(--accent-success)" />
                  </div>
                  <p style={{ fontSize: '0.875rem' }}>Submitted: {new Date(task.submissionDate).toLocaleDateString()}</p>
                  <Link to={`/user/task/${task.id}`} className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'center' }}>
                    <Edit size={16} /> Modify Setup
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
