import styles from '../../pages/Cart.module.css';

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function CartSummary({ totalPrice, onCheckout }) {
  return (
    <div className={styles.cartSummary}>
      <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>
      <div className={styles.summaryRow}>
        <span>Tổng tiền hàng</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>
      <div className={styles.summaryRow}>
        <span>Phí vận chuyển</span>
        <span>Chưa tính</span>
      </div>
      
      <div className={styles.summaryTotalRow}>
        <span className={styles.summaryTotalLabel}>Tổng thanh toán</span>
        <span className={styles.summaryTotalValue}>{formatPrice(totalPrice)}</span>
      </div>
      
      <button className={styles.checkoutBtn} onClick={onCheckout}>
        Mua hàng
      </button>
    </div>
  );
}
