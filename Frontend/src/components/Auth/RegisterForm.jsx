import { useState } from 'react';
import styles from './AuthForm.module.css';
import API from '../../services/api';

export default function RegisterForm({ onRegister }) {
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await API.post('/register', { full_name, email, password, phone, role });
      setSuccess('Đăng ký thành công!');
      onRegister && onRegister(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles['auth-form']}>
      <h2>Đăng ký</h2>
      <input
        type="text"
        placeholder="Họ và tên"
        value={full_name}
        onChange={e => setFullName(e.target.value)}
        required
      />
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
      <input
        type="text"
        placeholder="Số điện thoại"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        required
      />
      <select
        value={role}
        onChange={e => setRole(e.target.value)}
        required
      >
        <option value="buyer">Người mua</option>
        <option value="seller">Người bán</option>
      </select>
      <button type="submit">Đăng ký</button>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
    </form>
  );
}
