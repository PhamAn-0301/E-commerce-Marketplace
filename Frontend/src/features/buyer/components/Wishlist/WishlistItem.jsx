import { Link } from 'react-router-dom';
import styles from '../../pages/Wishlist.module.css';

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function WishlistItem({ item, onRemove }) {
  return (
    <div className={styles.wishlistCard}>
      <div className={styles.imageContainer}>
        <img src={item.thumbnails || 'https://via.placeholder.com/200'} alt={item.product_name} />
        <button 
          className={styles.removeBtn} 
          onClick={() => onRemove(item.wishlist_item_id)}
          title="Xóa khỏi yêu thích"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className={styles.infoContainer}>
        <Link to={`/product/${item.product_id}`} className={styles.productName}>
          {item.product_name}
        </Link>
        <div className={styles.productVariant}>{item.variant_name}</div>
        <div className={styles.productPrice}>{formatPrice(item.price)}</div>
      </div>
    </div>
  );
}
