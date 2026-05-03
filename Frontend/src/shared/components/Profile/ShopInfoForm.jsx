import { useState } from 'react';
import styles from '../../pages/Profile.module.css';
import API from '../../services/api';

// Form cập nhật thông tin shop (chỉ dành cho seller).
export default function ShopInfoForm({ shop }) {
  const [shopName, setShopName] = useState(shop?.shop_name || '');
  const [description, setDescription] = useState(shop?.description || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await API.put('/api/user/shop', { shop_name: shopName, description });
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Cập nhật shop thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!shop) {
    return (
      <div className={styles['profile-card']}>
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Thông tin Shop
        </h2>
        <p style={{ color: '#6b7280' }}>Bạn chưa có shop nào.</p>
      </div>
    );
  }

  return (
    <div className={styles['profile-card']}>
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Thông tin Shop
      </h2>
      {success && <div className={styles['profile-success']}>{success}</div>}
      {error && <div className={styles['profile-error']}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className={styles['form-group']}>
          <label>Tên Shop</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Nhập tên shop"
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label>Mô tả Shop</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả shop"
          />
        </div>
        <button type="submit" className={styles['profile-btn']} disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu thông tin Shop'}
        </button>
      </form>
    </div>
  );
}
