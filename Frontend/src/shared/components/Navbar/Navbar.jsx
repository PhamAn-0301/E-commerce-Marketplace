import { NavLink } from 'react-router-dom';

import styles from './Navbar.module.css';
import Logo from '../../../features/buyer/pages/Logo';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className={styles.navbar}>
      <NavLink to="/" className={styles['navbar-logo']}>
        <Logo size={28} />
      </NavLink>
      <div className={styles['navbar-links']}>
        <NavLink to="/">Trang chủ</NavLink>
        {!user && <NavLink to="/login">Đăng nhập</NavLink>}
        {!user && <NavLink to="/register">Đăng ký</NavLink>}
        {user && <NavLink to="/profile">Tài khoản</NavLink>}
        {user && <button onClick={onLogout}>Đăng xuất</button>}
      </div>
    </nav>
  );
}
