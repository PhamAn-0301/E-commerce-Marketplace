import { useState, useEffect } from 'react';
import API from '../../../shared/services/api';
import styles from './Wishlist.module.css';
import WishlistItem from '../components/Wishlist/WishlistItem';
import EmptyWishlist from '../components/Wishlist/EmptyWishlist';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/wishlist');
      setItems(res.data.items || []);
    } catch (err) {
      setError('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      await API.delete(`/api/wishlist/remove/${itemId}`);
      setItems(items.filter(item => item.wishlist_item_id !== itemId));
    } catch (err) {
      alert('Không thể xóa sản phẩm khỏi danh sách yêu thích');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (items.length === 0) {
    return (
      <div className={styles.wishlistPage}>
        <h1 className={styles.pageTitle}>Sản phẩm yêu thích</h1>
        <EmptyWishlist />
      </div>
    );
  }

  return (
    <div className={styles.wishlistPage}>
      <h1 className={styles.pageTitle}>Sản phẩm yêu thích</h1>
      <div className={styles.wishlistGrid}>
        {items.map(item => (
          <WishlistItem 
            key={item.wishlist_item_id} 
            item={item} 
            onRemove={handleRemove} 
          />
        ))}
      </div>
    </div>
  );
}
