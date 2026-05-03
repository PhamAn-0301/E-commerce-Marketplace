import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import Logo from '../../../features/buyer/pages/Logo';
import API from '../../services/api';

export default function Navbar({ user, onLogout }) {
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }
    try {
      const res = await API.get('/api/cart');
      const items = res.data.items || [];
      // Tổng số lượng sản phẩm
      const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalCount);
    } catch (err) {
      console.error('Failed to fetch cart count');
    }
  };

  useEffect(() => {
    fetchCartCount();
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => window.removeEventListener('cartUpdated', fetchCartCount);
  }, [user]);
  return (
    <nav className={styles.navbar}>
      <NavLink to="/" className={styles['navbar-logo']}>
        <Logo size={28} />
      </NavLink>
      <div className={styles['navbar-links']}>
        <NavLink to="/">Trang chủ</NavLink>
        {!user && <NavLink to="/login">Đăng nhập</NavLink>}
        {!user && <NavLink to="/register">Đăng ký</NavLink>}
        {user && (
          <NavLink to="/profile" className={styles.iconLink} title="Tài khoản">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </NavLink>
        )}
        {user && user.role !== 'seller' && (
          <NavLink to="/wishlist" className={styles.iconLink} title="Yêu thích">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </NavLink>
        )}
        {user && user.role !== 'seller' && (
          <NavLink to="/cart" className={styles.cartLink} title="Giỏ hàng">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>}
          </NavLink>
        )}
        {user && <button onClick={onLogout}>Đăng xuất</button>}
      </div>
    </nav>
  );
}
