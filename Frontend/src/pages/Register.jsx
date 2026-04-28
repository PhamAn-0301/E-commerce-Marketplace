import { useState } from 'react';
import API from '../services/api';

export default function Register({ onRegister }) {
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
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '40px auto' }}>
      <h2>Đăng ký</h2>
      <input
        type="text"
        placeholder="Họ và tên"
        value={full_name}
        onChange={e => setFullName(e.target.value)}
        required
        style={{ width: '100%', marginBottom: 8 }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ width: '100%', marginBottom: 8 }}
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ width: '100%', marginBottom: 8 }}
      />
      <input
        type="text"
        placeholder="Số điện thoại"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        required
        style={{ width: '100%', marginBottom: 8 }}
      />
      <select
        value={role}
        onChange={e => setRole(e.target.value)}
        required
        style={{ width: '100%', marginBottom: 8 }}
      >
        <option value="buyer">Người mua</option>
        <option value="seller">Người bán</option>
      </select>
      <button type="submit" style={{ width: '100%' }}>Đăng ký</button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
    </form>
  );
}
