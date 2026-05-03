import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import Home from '../features/buyer/pages/Home';
import Login from '../features/Auth/pages/Login';
import Register from '../features/Auth/pages/Register';
import ProductDetail from '../features/buyer/pages/ProductDetail';
import Cart from '../features/buyer/pages/Cart';
import Wishlist from '../features/buyer/pages/Wishlist';
import Profile from '../shared/pages/Profile';
import Navbar from '../shared/components/Navbar/Navbar';
import API from '../shared/services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi App mount, kiểm tra localStorage có token không.
  // Nếu có thì gọi API lấy profile để restore session (tự đăng nhập lại).
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    API.get('/api/user/profile')
      .then((res) => {
        setUser(res.data.profile || null);
      })
      .catch(() => {
        // Token hết hạn hoặc không hợp lệ → xóa token.
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (userData) => {
    // Set user tạm từ login response trước.
    setUser(userData.user || userData);
    // Sau đó fetch profile đầy đủ (bao gồm shop nếu là seller).
    try {
      const res = await API.get('/api/user/profile');
      setUser(res.data.profile || userData.user || userData);
    } catch {
      // Nếu fetch profile lỗi, giữ nguyên user từ login.
    }
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) return null;

  return (
    <BrowserRouter>
      <AppLayout user={user} onLogin={handleLogin} onLogout={handleLogout} setUser={setUser} />
    </BrowserRouter>
  );
}

function AppLayout({ user, onLogin, onLogout, setUser }) {
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
          <Route path="/products/:id" element={<ProductDetail user={user} />} />
          <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" replace />} />
          <Route path="/cart" element={user && user.role !== 'seller' ? <Cart user={user} /> : <Navigate to="/" replace />} />
          <Route path="/wishlist" element={user && user.role !== 'seller' ? <Wishlist /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

