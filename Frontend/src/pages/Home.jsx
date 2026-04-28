import styles from './Home.module.css';

export default function Home({ user }) {
  // Giả sử user có thuộc tính role: 'buyer' | 'seller' | 'admin'
  if (!user) {
    // Dashboard cho khách chưa đăng nhập (giống buyer)
    return (
      <div className={styles['home-container']}>
        <div className={styles['home-title']}>Chào mừng đến với E-commerce Marketplace</div>
        <div className={styles['home-desc']}>
          Khám phá hàng ngàn sản phẩm, đăng nhập để mua sắm và quản lý đơn hàng dễ dàng!
        </div>
        <div className={styles['role-section']}>
          <div className={styles['role-card']}>
            <div className={styles['role-title']}>Người mua (Buyer)</div>
            <div className={styles['role-desc']}>
              Xem sản phẩm, thêm vào giỏ hàng, đặt hàng và theo dõi đơn hàng.
            </div>
          </div>
          <div className={styles['role-card']}>
            <div className={styles['role-title']}>Người bán (Seller)</div>
            <div className={styles['role-desc']}>
              Đăng nhập để quản lý sản phẩm, xem đơn hàng và doanh thu.
            </div>
          </div>
          <div className={styles['role-card']}>
            <div className={styles['role-title']}>Quản trị viên (Admin)</div>
            <div className={styles['role-desc']}>
              Quản lý người dùng, kiểm duyệt sản phẩm và thống kê hệ thống.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sau khi đăng nhập, giao diện theo role
  if (user.role === 'buyer') {
    return (
      <div className={styles['home-container']}>
        <div className={styles['home-title']}>Chào mừng, {user.name || user.email}!</div>
        <div className={styles['home-desc']}>
          Bạn có thể xem sản phẩm, đặt hàng và theo dõi đơn hàng của mình tại đây.
        </div>
        {/* TODO: Thêm các component buyer dashboard */}
      </div>
    );
  }
  if (user.role === 'seller') {
    return (
      <div className={styles['home-container']}>
        <div className={styles['home-title']}>Bảng điều khiển người bán</div>
        <div className={styles['home-desc']}>
          Quản lý sản phẩm, xem đơn hàng và doanh thu của bạn.
        </div>
        {/* TODO: Thêm các component seller dashboard */}
      </div>
    );
  }
  if (user.role === 'admin') {
    return (
      <div className={styles['home-container']}>
        <div className={styles['home-title']}>Bảng điều khiển quản trị viên</div>
        <div className={styles['home-desc']}>
          Quản lý hệ thống, người dùng và thống kê toàn bộ marketplace.
        </div>
        {/* TODO: Thêm các component admin dashboard */}
      </div>
    );
  }
  // Nếu role không xác định
  return (
    <div className={styles['home-container']}>
      <div className={styles['home-title']}>Chào mừng đến với E-commerce Marketplace</div>
    </div>
  );
}
