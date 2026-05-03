import { Link } from 'react-router-dom';
import styles from '../../pages/Cart.module.css';

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className={styles.cartItem}>
      <img 
        src={item.thumbnails || 'https://via.placeholder.com/80'} 
        alt={item.product_name} 
        className={styles.itemImage} 
      />
      
      <div className={styles.itemInfo}>
        <Link to={`/product/${item.product_id}`} className={styles.itemName}>
          {item.product_name}
        </Link>
        <div className={styles.itemVariant}>Phân loại: {item.variant_name}</div>
        <div className={styles.itemPrice}>{formatPrice(item.price)}</div>
      </div>
      
      <div className={styles.quantityControl}>
        <button 
          className={styles.qtyBtn}
          onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity - 1, item.stock)}
          disabled={item.quantity <= 1}
        >-</button>
        <input 
          type="text" 
          readOnly 
          className={styles.qtyInput} 
          value={item.quantity} 
        />
        <button 
          className={styles.qtyBtn}
          onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity + 1, item.stock)}
          disabled={item.quantity >= 20 || item.quantity >= item.stock}
        >+</button>
      </div>
      
      <div className={styles.itemActions}>
        <div className={styles.itemTotal}>
          {formatPrice(Number(item.price) * item.quantity)}
        </div>
        <button 
          className={styles.removeBtn}
          onClick={() => onRemove(item.cart_item_id)}
          title="Xóa sản phẩm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
