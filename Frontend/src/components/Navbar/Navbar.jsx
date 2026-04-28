import styles from './Navbar.module.css';
import Logo from '../Logo';

export default function Navbar({ user, onNavigate, onLogout }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles['navbar-logo']} onClick={() => onNavigate('home')}>
        <Logo size={28} />
      </div>
      <div className={styles['navbar-links']}>
        <button onClick={() => onNavigate('home')}>Trang chủ</button>
        {!user && <button onClick={() => onNavigate('login')}>Đăng nhập</button>}
        {!user && <button onClick={() => onNavigate('register')}>Đăng ký</button>}
        {user && <button onClick={onLogout}>Đăng xuất</button>}
      </div>
    </nav>
  );
}
