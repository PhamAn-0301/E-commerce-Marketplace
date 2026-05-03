import { useState } from 'react';
import styles from '../../pages/Profile.module.css';
import API from '../../services/api';

// Form cập nhật thông tin cá nhân (full_name, phone).
export default function ProfileInfoForm({ user, setUser }) {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await API.put('/api/user/profile', { full_name: fullName, phone });
      setSuccess(res.data.message);
      // Cập nhật user state ở App để Navbar, trang chủ phản ánh đúng tên mới.
      if (res.data.user) {
        setUser((prev) => ({ ...prev, ...res.data.user }));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['profile-card']}>
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Thông tin cá nhân
      </h2>
      {success && <div className={styles['profile-success']}>{success}</div>}
      {error && <div className={styles['profile-error']}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className={styles['form-group']}>
          <label>Email</label>
          <input type="email" value={user.email} readOnly />
        </div>
        <div className={styles['form-group']}>
          <label>Họ và tên</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ tên"
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label>Số điện thoại</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
            required
          />
        </div>
        <button type="submit" className={styles['profile-btn']} disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
}
