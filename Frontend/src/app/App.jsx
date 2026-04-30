import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import Home from '../features/buyer/pages/Home';
import Login from '../features/Auth/pages/Login';
import Register from '../features/Auth/pages/Register';
import ProductDetail from '../features/buyer/pages/ProductDetail';
import Navbar from '../shared/components/Navbar/Navbar';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData.user || userData);
  };
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <AppLayout user={user} onLogin={handleLogin} onLogout={handleLogout} />
    </BrowserRouter>
  );
}

function AppLayout({ user, onLogin, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar user={user} onLogout={handleLogout} />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 18px 32px' }}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onLogin={onLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
