import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../supabaseClient';
import Editor from '@monaco-editor/react';
import { CheckCircle, Play, AlertTriangle, MessageSquare, Upload, FileText } from 'lucide-react';

export default function EditorTask() {
  const { taskId } = useParams();
  const { tasks, submitTask, currentUser } = useData();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const task = tasks.find(t => t.id === taskId);
  
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    if (task && !code) {
      if (task.code) {
        setCode(task.code);
      } else if (task.type === 'python') {
        setCode('# Write your Python code here...\n\n');
      } else if (task.type === 'html') {
        setCode('<!-- Your HTML goes here -->\n\n');
      } else if (task.type === 'javascript') {
        setCode('// JavaScript Solution\n\n');
      } else if (task.type === 'css') {
        setCode('/* CSS Styles */\n\n');
      }
    }
  }, [task, code]);

  if (!task) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Task not found!</div>;
  }

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleRunAndVerify = () => {
    setIsVerifying(true);
    setValidationResult(null);

    // Mock validation logic
    setTimeout(() => {
      setIsVerifying(false);
      
      if (task.type === 'file_upload') {
        if (!code) {
          setValidationResult({ status: 'error', message: 'No file selected.' });
        } else {
          try {
            const parsed = JSON.parse(code);
            if (task.expectedOutput && !parsed.name.toLowerCase().endsWith(task.expectedOutput.replace(/\s/g, '').toLowerCase())) {
              setValidationResult({ status: 'error', message: `Invalid file type. Expected ${task.expectedOutput}` });
            } else {
              setValidationResult({ status: 'success', message: 'File ready to submit!' });
            }
          } catch(e) {
            setValidationResult({ status: 'error', message: 'Corrupted file data or wait for upload.' });
          }
        }
      } else if (task.type === 'text_ack') {
        if (!code.trim()) {
          setValidationResult({ status: 'error', message: 'Response cannot be empty.' });
        } else if (task.expectedOutput && !code.toLowerCase().includes(task.expectedOutput.toLowerCase())) {
          setValidationResult({ status: 'error', message: `Did not find expected word: "${task.expectedOutput}"` });
        } else {
          setValidationResult({ status: 'success', message: 'Response captured!' });
        }
      } else {
        const containsExpected = code.toLowerCase().includes(task.expectedOutput.toLowerCase());
        
        if (containsExpected) {
          setValidationResult({ status: 'success', message: 'Test Cases Passed! Perfect solution.' });
        } else {
          setValidationResult({ status: 'error', message: `Verification Failed. Did not find expected pattern: "${task.expectedOutput}". Try again.` });
        }
      }
    }, 1500);
  };

  const handleSubmit = () => {
    submitTask(task.id, code);
    navigate('/user');
  };

  const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

  return (
    <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 120px)', alignItems: 'stretch' }}>
      
      {/* Left Panel: Prompt & Info */}
      <div className="card glass-panel" style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <MessageSquare size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Task Brief</h2>
        </div>

        <h3 style={{ fontSize: '1.25rem' }}>{task.title}</h3>
        
        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '1rem', fontHeight: 1.6 }}>
          {task.description}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {validationResult && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              background: validationResult.status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: validationResult.status === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {validationResult.status === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
              <span style={{ fontSize: '0.875rem' }}>{validationResult.message}</span>
            </div>
          )}

          <button 
            onClick={validationResult?.status === 'success' ? handleSubmit : handleRunAndVerify}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', backgroundColor: validationResult?.status === 'success' ? 'var(--accent-success)' : 'var(--accent-primary)' }}
            disabled={isVerifying}
          >
            {isVerifying ? 'Verifying...' : 
              validationResult?.status === 'success' ? (task.status === 'completed' ? 'Update Submission' : 'Submit Solution') : 
              (task.type === 'file_upload' ? 'Upload & Verify' : task.type === 'text_ack' ? 'Submit / Acknowledge' : 'Run Code & Verify')}
          </button>
        </div>
      </div>

      {/* Right Panel: Editor Area */}
      <div className="card glass-panel" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            {task.type === 'file_upload' ? <><Upload size={18}/> File Upload</> 
              : task.type === 'text_ack' ? <><FileText size={18}/> Text Response</>
              : <><span style={{ color: 'var(--accent-primary)' }}>{task.type.toUpperCase()}</span> Editor</>}
          </div>
          {task.type !== 'file_upload' && task.type !== 'text_ack' && (
            <button onClick={handleRunAndVerify} className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', gap: '0.25rem', color: 'var(--accent-primary)' }}>
              <Play size={14} fill="currentColor" /> Run Code
            </button>
          )}
        </div>
        
        <div style={{ flex: 1, position: 'relative' }}>
          {task.type === 'file_upload' ? (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', background: 'var(--bg-main)' }}>
                <Upload size={48} color="var(--text-muted)" />
                <p style={{ color: 'var(--text-muted)' }}>Click below to select your document/photo to upload for this task</p>
                <input type="file" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setIsVerifying(true);
                    setValidationResult(null);

                    const fileExt = file.name.split('.').pop();
                    const fileName = `${task.id}-${Date.now()}.${fileExt}`;
                    const filePath = `${currentUser?.username || 'user'}/${fileName}`;

                    const { error } = await supabase.storage
                      .from('task-uploads')
                      .upload(filePath, file);

                    if (error) {
                      console.error('Upload Error:', error);
                      setValidationResult({ status: 'error', message: 'Storage error: ' + error.message });
                      setCode('');
                    } else {
                      const { data: publicData } = supabase.storage
                        .from('task-uploads')
                        .getPublicUrl(filePath);
                      
                      setCode(JSON.stringify({ name: file.name, url: publicData.publicUrl }));
                      setValidationResult({ status: 'success', message: 'Securely uploaded to cloud!' });
                    }
                    setIsVerifying(false);
                  } else {
                    setCode('');
                  }
                }} style={{ padding: '1rem', width: '250px', border: '1px dashed var(--border-color)', borderRadius: '8px', cursor: 'pointer' }} />
                {code && (() => { 
                  try { 
                    const p = JSON.parse(code); 
                    return <div style={{ color: 'var(--accent-success)', fontWeight: 600 }}>Ready to upload: {p.name}</div>; 
                  } catch(e) { return null; } 
                })()}
             </div>
          ) : task.type === 'text_ack' ? (
             <textarea 
               value={code} 
               onChange={(e) => setCode(e.target.value)} 
               placeholder="Write your acknowledgment or response here..."
               style={{ width: '100%', height: '100%', padding: '1.5rem', background: 'var(--bg-main)', color: 'var(--text-main)', border: 'none', resize: 'none', fontSize: '1rem' }}
             />
          ) : (
             <Editor
              height="100%"
              language={task.type === 'python' ? 'python' : task.type === 'html' ? 'html' : task.type === 'css' ? 'css' : 'javascript'}
              theme={editorTheme}
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
