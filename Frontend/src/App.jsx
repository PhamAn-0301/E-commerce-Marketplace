import { useState } from 'react';

import Home from './pages/Home';
import Login from './pages/User/Login';
import Register from './pages/User/Register';
import Navbar from './components/Navbar/Navbar';

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
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f6f8fa' }}>
      <Navbar user={user} onNavigate={setPage} onLogout={handleLogout} />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        {page === 'home' && <Home user={user} />}
        {page === 'login' && <Login onLogin={handleLogin} />}
        {page === 'register' && <Register onRegister={handleRegister} />}
        {/* Greeting and dashboard now handled in Home component */}
      </div>
    </div>
  );
}

export default App;