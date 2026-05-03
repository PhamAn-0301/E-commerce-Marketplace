import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../shared/services/api';
import styles from './Cart.module.css';
import CartItem from '../components/Cart/CartItem';
import CartSummary from '../components/Cart/CartSummary';

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function Cart({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/cart');
      setItems(res.data.items || []);
      setError('');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Vui lòng đăng nhập để xem giỏ hàng.');
      } else {
        setError('Không thể tải giỏ hàng.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
      setError('Vui lòng đăng nhập để xem giỏ hàng.');
    }
  }, [user]);

  const updateQuantity = async (cartItemId, newQuantity, maxStock) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 20) newQuantity = 20;
    if (newQuantity > maxStock) newQuantity = maxStock;

    // Optimistic update
    const prevItems = [...items];
    setItems(items.map(item => 
      item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item
    ));

    try {
      await API.put(`/api/cart/update/${cartItemId}`, { quantity: newQuantity });
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi cập nhật số lượng');
      setItems(prevItems); // Rollback if error
    }
  };

  const removeItem = async (cartItemId) => {
    if (!window.confirm('Bạn muốn xóa sản phẩm này khỏi giỏ hàng?')) return;

    try {
      await API.delete(`/api/cart/remove/${cartItemId}`);
      setItems(items.filter(item => item.cart_item_id !== cartItemId));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi xóa sản phẩm');
    }
  };

  if (loading) {
    return <div className={styles.cartPage}>Đang tải giỏ hàng...</div>;
  }

  if (error) {
    return (
      <div className={styles.cartPage}>
        <div className={styles.emptyCart}>
          <p>{error}</p>
          <Link to="/login" className={styles.shopNowBtn}>Đăng nhập ngay</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.cartPage}>
        <div className={styles.emptyCart}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p>Giỏ hàng của bạn còn trống</p>
          <Link to="/" className={styles.shopNowBtn}>Mua sắm ngay</Link>
        </div>
      </div>
    );
  }

  // Nhóm items theo shop
  const shopGroups = {};
  items.forEach(item => {
    if (!shopGroups[item.shop_id]) {
      shopGroups[item.shop_id] = {
        shopName: item.shop_name,
        items: []
      };
    }
    shopGroups[item.shop_id].items.push(item);
  });

  // Tính tổng tiền
  const totalPrice = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={styles.cartPage}>
      <h1 className={styles.cartTitle}>Giỏ hàng của bạn ({totalItems} sản phẩm)</h1>
      
      <div className={styles.cartLayout}>
        {/* Cột trái: Danh sách sản phẩm */}
        <div className={styles.cartItems}>
          {Object.values(shopGroups).map((group, idx) => (
            <div key={idx} className={styles.shopGroup}>
              <div className={styles.shopHeader}>
                <div className={styles.shopIcon}>
                  {group.shopName.charAt(0).toUpperCase()}
                </div>
                <span className={styles.shopName}>{group.shopName}</span>
              </div>
              
              <div className={styles.shopItems}>
                {group.items.map(item => (
                  <CartItem 
                    key={item.cart_item_id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cột phải: Summary */}
        <CartSummary 
          totalPrice={totalPrice} 
          onCheckout={() => alert('Chức năng thanh toán đang được phát triển!')} 
        />
      </div>
    </div>
  );
}
