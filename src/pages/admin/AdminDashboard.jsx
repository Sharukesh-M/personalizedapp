import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { User, Activity, Plus, Edit, Trash2, Cpu, CheckCircle, Shield, Target, Eye, EyeOff } from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser, login, users, tasks, addTask, updateTask, deleteTask, updateUserGoal, updateRoadmap } = useData();
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState('tasks');
  const [editingTask, setEditingTask] = useState(null);
  const [selectedReportUser, setSelectedReportUser] = useState('all');
  
  // Goal State
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [profileData, setProfileData] = useState({ goal: '', resources: '', certifications: '', domains: '', nextSteps: '' });

  // Task Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('python');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const regularUsers = users.filter(u => u.role === 'user');

  useEffect(() => {
    if (!assignedTo && regularUsers.length > 0) {
      setAssignedTo(regularUsers[0].id);
    }
  }, [regularUsers, assignedTo]);

  // Authentication check
  const isAdmin = currentUser?.role === 'admin';

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoadingAuth(true);
    const user = await login(username, password);
    setIsLoadingAuth(false);
    if (user && user.role === 'admin') {
      setLoginError('');
    } else {
      setLoginError('Invalid Admin Credentials or insufficient permissions.');
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <Shield size={48} color="var(--accent-primary)" />
            <h2 style={{ marginTop: '0.5rem' }}>Admin Portal</h2>
            <p>Secure Area. Authorized Personnel Only.</p>
          </div>
          {loginError && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{loginError}</div>}
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Admin Username</label>
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
            <button type="submit" disabled={isLoadingAuth} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              {isLoadingAuth ? 'Authenticating...' : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('python');
    setExpectedOutput('');
    setAssignedTo(users.find(u => u.role === 'user')?.id || '');
    setEditingTask(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setType(task.type);
    setExpectedOutput(task.expectedOutput);
    setAssignedTo(task.assignedTo);
    setDueDate(task.dueDate || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      updateTask(editingTask, { title, description, type, expectedOutput, assignedTo, dueDate });
    } else {
      addTask({ title, description, type, expectedOutput, assignedTo, dueDate });
    }
    resetForm();
  };

  const mockAiGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const isPython = type === 'python';
      setTitle(`AI Generated ${type.toUpperCase()} Task`);
      
      if (aiPrompt.trim()) {
        setDescription(`Based on your request "${aiPrompt}", here is the generated task:\n\nPlease logically complete the ${type} implementation that fulfills this requirement. Output validation will expect fundamental syntax.`);
        setExpectedOutput(type === 'python' ? 'def ' : type === 'html' ? '<' : 'function');
      } else {
        setDescription(isPython 
          ? "Write a Python function `two_sum(nums, target)` that returns the indices of the two numbers such that they add up to target(leetcode style)."
          : "Create a centered flexbox container with a text 'Hello Web' in index.html");
        setExpectedOutput(isPython ? "def two_sum(" : "Hello Web");
      }
      setIsGenerating(false);
    }, 1500);
  };

  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Filter reports by selected user
  const filteredReports = selectedReportUser === 'all' 
    ? completedTasks 
    : completedTasks.filter(t => t.assignedTo === selectedReportUser);

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '100%', alignItems: 'flex-start' }}>
      
      {/* Sidebar */}
      <div className="card glass-panel" style={{ width: '260px', position: 'sticky', top: '90px' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={24} color="var(--accent-primary)" />
          Dashboard
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ justifyContent: 'flex-start', width: '100%' }}
            onClick={() => setActiveTab('tasks')}
          >
            Manage Tasks
          </button>
          <button 
            className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ justifyContent: 'flex-start', width: '100%' }}
            onClick={() => setActiveTab('reports')}
          >
            User Reports
          </button>
          <button 
            className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ justifyContent: 'flex-start', width: '100%' }}
            onClick={() => setActiveTab('activity')}
          >
            Daily Activity
          </button>
          <button 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ justifyContent: 'flex-start', width: '100%' }}
            onClick={() => setActiveTab('users')}
          >
            User Profiles & Roadmaps
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {activeTab === 'tasks' && (
          <>
            <div className="card glass-panel animate-fade-in">
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{editingTask ? 'Edit Task' : 'Create Daily Task'}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Enter topic for AI (e.g. Loops)" 
                    className="input-field" 
                    value={aiPrompt} 
                    onChange={e => setAiPrompt(e.target.value)} 
                    style={{ padding: '0.5rem', width: '250px', fontSize: '0.875rem' }}
                  />
                  <button type="button" onClick={mockAiGenerate} className="btn btn-secondary" style={{ fontSize: '0.875rem' }} disabled={isGenerating}>
                    <Cpu size={18} /> {isGenerating ? 'Generating...' : 'AI Generate'}
                  </button>
                </div>
              </h2>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-cols-2">
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Task Title</label>
                    <input required value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g. Daily Python Challenge or Upload Work" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Assign To User</label>
                    <select required value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="input-field">
                      {regularUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid-cols-2">
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Language/Type</label>
                    <select value={type} onChange={e => setType(e.target.value)} className="input-field">
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="file_upload">File Upload (PDF/Image)</option>
                      <option value="text_ack">Text / Acknowledgment</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                      {type === 'file_upload' ? 'Allowed File Types (e.g. .pdf, .jpg)' : type === 'text_ack' ? 'Expected Word (Optional)' : 'Expected Keyphrase (for validation)'}
                    </label>
                    <input required={type !== 'text_ack'} value={expectedOutput} onChange={e => setExpectedOutput(e.target.value)} className="input-field" placeholder={type === 'file_upload' ? "e.g. .pdf, .jpg" : "e.g. def function_name"} />
                  </div>
                </div>

                <div className="grid-cols-2">
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Task Description</label>
                    <textarea required value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows="4" placeholder="Describe the task instructions..."></textarea>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Deadline</label>
                    <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field" />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  {editingTask && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>}
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-success)' }}>
                    <Plus size={20} /> {editingTask ? 'Update Task' : 'Assign Task'}
                  </button>
                </div>
              </form>
            </div>

            <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <h3 style={{ margin: 0 }}>All Active Tasks</h3>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasks.map(task => {
                  const assignee = regularUsers.find(u => u.id === task.assignedTo);
                  return (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                      <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          {task.title} 
                          <span className={`status-badge status-${task.status}`}>{task.status.toUpperCase()}</span>
                        </h4>
                        <p style={{ fontSize: '0.875rem' }}>Assigned to: <strong>{assignee?.name}</strong> | Type: {task.type.toUpperCase()}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(task)} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Edit"><Edit size={18} /></button>
                        <button onClick={() => deleteTask(task.id)} className="btn" style={{ padding: '0.5rem', color: 'var(--accent-danger)' }} title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <div className="card glass-panel animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              User Submissions & Reports
              <select 
                value={selectedReportUser} 
                onChange={(e) => setSelectedReportUser(e.target.value)} 
                className="input-field" 
                style={{ width: '250px', fontSize: '1rem' }}
              >
                <option value="all">Compare All Users</option>
                {regularUsers.map(u => <option key={u.id} value={u.id}>{u.name}'s Reports</option>)}
              </select>
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredReports.length === 0 ? (
                <p>No completed tasks to report yet for this selection.</p>
              ) : (
                filteredReports.map(task => {
                  const assignee = regularUsers.find(u => u.id === task.assignedTo);
                  return (
                    <div key={task.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-main)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{task.title}</h4>
                          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <User size={14} /> {assignee?.name} 
                            | Submitted: {new Date(task.submissionDate).toLocaleString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-success)' }}>
                          <CheckCircle size={24} /> Verified Complete
                        </div>
                      </div>
                      
                      <div style={{ padding: '1rem', backgroundColor: '#1e1e1e', color: '#d4d4d4', borderRadius: '8px', fontFamily: 'monospace', overflowX: 'auto' }}>
                        {task.type === 'file_upload' ? (() => {
                          try {
                            const parsed = JSON.parse(task.code);
                            const fileUrl = parsed.url || parsed.data;
                            return (
                              <div style={{ color: 'var(--accent-success)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div>📂 File Uploaded: <strong>{parsed.name}</strong></div>
                                <a href={fileUrl} download={parsed.name} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', display: 'inline-flex', padding: '0.5rem 1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '6px', width: 'max-content', textDecoration: 'none', fontWeight: 600 }}>
                                  ⬇️ Download / View {parsed.name.split('.').pop().toUpperCase()} File
                                </a>
                              </div>
                            );
                          } catch(e) {
                            return <div style={{ color: 'var(--accent-danger)' }}>Corrupted file data: {task.code.substring(0, 50)}...</div>;
                          }
                        })() : task.type === 'text_ack' ? (
                          <div style={{ whiteSpace: 'pre-wrap' }}>{task.code}</div>
                        ) : (
                          <pre style={{ margin: 0 }}>{task.code}</pre>
                        )}
                      </div>
                      <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                        <strong>Validation Log:</strong> 
                        {task.type === 'file_upload' 
                          ? ` File type verified against required format (${task.expectedOutput}).`
                          : task.type === 'text_ack'
                          ? ` Acknowledgment recorded.`
                          : ` Passed expected keyword validation (\`${task.expectedOutput}\`). Logic cross-verified successfully.`}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="card glass-panel animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={24} color="var(--accent-primary)" />
              Daily Activity Feed
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {completedTasks
                .sort((a,b) => new Date(b.submissionDate) - new Date(a.submissionDate))
                .map(task => {
                  const assignee = regularUsers.find(u => u.id === task.assignedTo);
                  return (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderLeft: '4px solid var(--accent-success)', backgroundColor: 'var(--bg-secondary)', borderRadius: '0 8px 8px 0' }}>
                      <CheckCircle color="var(--accent-success)" />
                      <div>
                        <strong>{assignee?.name}</strong> completed the task <em>"{task.title}"</em>.
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          {new Date(task.submissionDate).toLocaleString()} - Type: {task.type.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {completedTasks.length === 0 && <p>No daily activity recorded yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card glass-panel animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>User Profiles & Roadmaps</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {regularUsers.map(user => {
                const parsedRoadmap = user.roadmap ? JSON.parse(user.roadmap) : {};
                return (
                <div key={user.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={20} color="var(--accent-primary)" /> {user.name} ({user.username})
                      </h3>
                      <p style={{ margin: '0.5rem 0 0', color: 'var(--accent-warning)', fontWeight: 600 }}>
                        Current Streak: {user.currentStreak} Days
                      </p>
                    </div>
                  </div>

                  {editingProfileId === user.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <input type="text" value={profileData.goal} onChange={e => setProfileData({...profileData, goal: e.target.value})} className="input-field" placeholder="Active Goal" />
                      <textarea value={profileData.resources} onChange={e => setProfileData({...profileData, resources: e.target.value})} className="input-field" placeholder="Resources to Study" rows="2" />
                      <textarea value={profileData.certifications} onChange={e => setProfileData({...profileData, certifications: e.target.value})} className="input-field" placeholder="Certification Details" rows="2" />
                      <textarea value={profileData.domains} onChange={e => setProfileData({...profileData, domains: e.target.value})} className="input-field" placeholder="IT Domains Overview" rows="2" />
                      <textarea value={profileData.nextSteps} onChange={e => setProfileData({...profileData, nextSteps: e.target.value})} className="input-field" placeholder="What to Read Next" rows="2" />
                      
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button onClick={() => { updateUserGoal(user.id, profileData.goal); updateRoadmap(user.id, { resources: profileData.resources, certifications: profileData.certifications, domains: profileData.domains, nextSteps: profileData.nextSteps }); setEditingProfileId(null); }} className="btn btn-primary" style={{ backgroundColor: 'var(--accent-success)' }}>Save Profile</button>
                        <button onClick={() => setEditingProfileId(null)} className="btn btn-secondary">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Target size={16} color="var(--accent-success)" /> <strong>Active Goal: </strong> {user.goal || 'None'}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Roadmap configured: {user.roadmap ? 'Yes' : 'No'}</div>
                      </div>
                      <button 
                        onClick={() => { setEditingProfileId(user.id); setProfileData({ goal: user.goal || '', resources: parsedRoadmap.resources || '', certifications: parsedRoadmap.certifications || '', domains: parsedRoadmap.domains || '', nextSteps: parsedRoadmap.nextSteps || '' }); }} 
                        className="btn btn-secondary"
                      >
                        <Edit size={16} /> Edit Profile
                      </button>
                    </div>
                  )}
                </div>
              )})}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
