import { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage('home');
  };
  const handleRegister = () => {
    setPage('login');
  };
  const handleLogout = () => {
    setUser(null);
    setPage('login');
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', gap: 16, justifyContent: 'center', margin: 24 }}>
        <button onClick={() => setPage('home')}>Trang chủ</button>
        {!user && <button onClick={() => setPage('login')}>Đăng nhập</button>}
        {!user && <button onClick={() => setPage('register')}>Đăng ký</button>}
        {user && <button onClick={handleLogout}>Đăng xuất</button>}
      </nav>
      <div>
        {page === 'home' && <Home />}
        {page === 'login' && <Login onLogin={handleLogin} />}
        {page === 'register' && <Register onRegister={handleRegister} />}
        {user && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <b>Xin chào, {user.name || user.email}!</b>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;