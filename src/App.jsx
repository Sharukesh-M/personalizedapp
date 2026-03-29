import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import EditorTask from './pages/user/EditorTask';
import ResourceCenter from './pages/user/ResourceCenter';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="app-main animate-fade-in" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin-page" element={<AdminDashboard />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/user/task/:taskId" element={<EditorTask />} />
            <Route path="/user/roadmap" element={<ResourceCenter />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
