import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('app-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Keep localStorage synced for persistence across hard reloads
  useEffect(() => {
    if (currentUser) localStorage.setItem('app-user', JSON.stringify(currentUser));
    else localStorage.removeItem('app-user');
  }, [currentUser]);

  // Load from Supabase on mount
  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (data && !error) setUsers(data);
    else console.error('Error fetching users (Make sure table exists):', error);
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (data && !error) setTasks(data);
    else console.error('Error fetching tasks (Make sure table exists):', error);
  };

  const login = async (username, pass) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('pass', pass)
      .single();

    if (data && !error) {
      setCurrentUser(data);
      return data;
    }
    return null;
  };

  const logout = () => setCurrentUser(null);

  const updateUserGoal = async (userId, newGoal) => {
    const { error } = await supabase.from('users').update({ goal: newGoal }).eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, goal: newGoal } : u));
      if (currentUser?.id === userId) setCurrentUser(prev => ({ ...prev, goal: newGoal }));
    }
  };

  const updatePassword = async (userId, newPassword) => {
    const { error } = await supabase.from('users').update({ pass: newPassword }).eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, pass: newPassword } : u));
      if (currentUser?.id === userId) setCurrentUser(prev => ({ ...prev, pass: newPassword }));
    }
  };

  const updateRoadmap = async (userId, roadmapData) => {
    const jsonStr = JSON.stringify(roadmapData);
    const { error } = await supabase.from('users').update({ roadmap: jsonStr }).eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, roadmap: jsonStr } : u));
      if (currentUser?.id === userId) setCurrentUser(prev => ({ ...prev, roadmap: jsonStr }));
    } else {
      console.error('Failed to update roadmap', error);
    }
  };


  const addTask = async (newTask) => {
    const taskRecord = { 
      ...newTask, 
      id: Date.now().toString(), 
      status: 'pending', 
      date: new Date().toISOString().split('T')[0] 
    };
    const { data, error } = await supabase.from('tasks').insert([taskRecord]).select();
    if (data && !error) {
      setTasks(prev => [data[0], ...prev]);
    }
  };

  const updateTask = async (id, updatedFields) => {
    const { error } = await supabase.from('tasks').update(updatedFields).eq('id', id);
    if (!error) setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  const submitTask = async (id, codeSnippet) => {
    const today = new Date().toISOString();
    const updates = { status: 'completed', submissionDate: today, code: codeSnippet };
    const { error } = await supabase.from('tasks').update(updates).eq('id', id);
    if (!error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

      // Automated Auto-Increment Streak Engine
      if (currentUser) {
        // Collect existing completed tasks (excluding this newly submitted one)
        const userTasks = tasks.filter(t => t.assignedTo === currentUser.id && t.status === 'completed' && t.id !== id);
        
        const now = new Date();
        const todayStr = now.toDateString();
        let activeStreak = currentUser.currentStreak || 0;

        const sorted = [...userTasks].sort((a,b) => new Date(b.submissionDate) - new Date(a.submissionDate));
        const lastTask = sorted[0];

        if (lastTask && lastTask.submissionDate) {
          const lastDate = new Date(lastTask.submissionDate);
          if (lastDate.toDateString() !== todayStr) {
            // Check exactly if their last task was completed literally yesterday
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);

            if (lastDate.toDateString() === yesterday.toDateString()) {
              activeStreak += 1; // Streak continues!
            } else {
              activeStreak = 1; // Missed a day, streak broken to 1!
            }
          }
        } else {
          activeStreak = 1; // Very first task ever completed logically starts day 1!
        }

        // Commit precisely if numbers changed
        if (activeStreak !== currentUser.currentStreak) {
          await supabase.from('users').update({ currentStreak: activeStreak }).eq('id', currentUser.id);
          setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, currentStreak: activeStreak } : u));
          setCurrentUser(prev => ({ ...prev, currentStreak: activeStreak }));
        }
      }
    }
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <DataContext.Provider value={{ users, tasks, currentUser, login, logout, addTask, updateTask, submitTask, deleteTask, updateUserGoal, updatePassword, updateRoadmap }}>
      {children}
    </DataContext.Provider>
  );
};
