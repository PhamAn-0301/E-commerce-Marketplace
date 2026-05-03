import styles from './Profile.module.css';
import ProfileInfoForm from '../components/Profile/ProfileInfoForm';
import ChangePasswordForm from '../components/Profile/ChangePasswordForm';
import ShopInfoForm from '../components/Profile/ShopInfoForm';

// Trang Profile dùng chung cho cả Buyer và Seller.
// Giao diện gồm 3 phần: thông tin cá nhân, đổi mật khẩu, thông tin shop (chỉ seller).
export default function Profile({ user, setUser }) {
  const roleLabel = user.role === 'seller' ? 'Người bán' : user.role === 'admin' ? 'Quản trị viên' : 'Người mua';

  return (
    <div className={styles['profile-container']}>
      {/* Header */}
      <div className={styles['profile-header']}>
        <div className={styles['profile-avatar']}>
          {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
        </div>
        <div className={styles['profile-header-info']}>
          <h1>{user.full_name || 'Người dùng'}</h1>
          <p>{user.email}</p>
          <span className={styles['profile-role-badge']}>{roleLabel}</span>
        </div>
      </div>

      {/* Thông tin cá nhân */}
      <ProfileInfoForm user={user} setUser={setUser} />

      {/* Đổi mật khẩu */}
      <ChangePasswordForm />

      {/* Thông tin Shop (chỉ seller) */}
      {user.role === 'seller' && <ShopInfoForm shop={user.shop} />}
    </div>
  );
}
