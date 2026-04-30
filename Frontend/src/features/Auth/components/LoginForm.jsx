import { useState } from 'react';
import styles from './AuthForm.module.css';
import API from '../../../shared/services/api';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/login', { email, password });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles['auth-form']}>
      <h2>Đăng nhập</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Đăng nhập</button>
      {error && <div className={styles.error}>{error}</div>}
    </form>
  );
}
