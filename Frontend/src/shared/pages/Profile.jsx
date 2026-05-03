import { useState } from 'react';
import styles from './Profile.module.css';
import ProfileInfoForm from '../components/Profile/ProfileInfoForm';
import ChangePasswordForm from '../components/Profile/ChangePasswordForm';
import ShopInfoForm from '../components/Profile/ShopInfoForm';

// Trang Profile dùng chung cho cả Buyer và Seller.
// Giao diện gồm 3 phần: thông tin cá nhân, đổi mật khẩu, thông tin shop (chỉ seller).
export default function Profile({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('profile');

  const roleLabel = user.role === 'seller' ? 'Người bán' : user.role === 'admin' ? 'Quản trị viên' : 'Người mua';

  return (
    <div className={styles['profile-page']}>
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

      <div className={styles['profile-container']}>
        {/* Sidebar */}
        <div className={styles['profile-sidebar']}>
          <div 
            className={`${styles['sidebar-item']} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Hồ sơ của tôi
          </div>
          <div 
            className={`${styles['sidebar-item']} ${activeTab === 'password' ? styles.active : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Đổi mật khẩu
          </div>
          {user.role === 'seller' && (
            <div 
              className={`${styles['sidebar-item']} ${activeTab === 'shop' ? styles.active : ''}`}
              onClick={() => setActiveTab('shop')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Thông tin Shop
            </div>
          )}
        </div>

        {/* Content */}
        <div className={styles['profile-content']}>
          {activeTab === 'profile' && <ProfileInfoForm user={user} setUser={setUser} />}
          {activeTab === 'password' && <ChangePasswordForm />}
          {activeTab === 'shop' && user.role === 'seller' && <ShopInfoForm shop={user.shop} />}
        </div>
      </div>
    </div>
  );
}
