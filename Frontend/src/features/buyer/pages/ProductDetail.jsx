import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import API from '../../../shared/services/api';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError('');
        const response = await API.get(`/api/products/${id}`);

        if (isMounted) {
          setProduct(response.data.product);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Không thể tải chi tiết sản phẩm.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className={styles.state}>Đang tải chi tiết sản phẩm...</div>;
  }

  if (error) {
    return (
      <div className={styles.state}>
        <div className={styles.error}>{error}</div>
        <Link to="/">Quay lại trang chủ</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.state}>
        <div>Không tìm thấy sản phẩm.</div>
        <Link to="/">Quay lại trang chủ</Link>
      </div>
    );
  }

  const imageUrl = product.image_url || product.image || product.thumbnail_url || product.thumbnail;
  const productName = product.name || product.title || 'Sản phẩm';

  return (
    <main className={styles.detail}>
      <Link to="/" className={styles.backLink}>Quay lại sản phẩm</Link>
      <section className={styles.product}>
        <div className={styles.media}>
          {imageUrl ? (
            <img src={imageUrl} alt={productName} />
          ) : (
            <div className={styles.placeholder}>{productName.charAt(0)}</div>
          )}
        </div>
        <div className={styles.content}>
          <h1>{productName}</h1>
          <div className={styles.price}>{formatPrice(product.price)}</div>
          <p>{product.description || 'Sản phẩm chưa có mô tả chi tiết.'}</p>
          {product.stock_quantity !== undefined && (
            <div className={styles.meta}>Tồn kho: {product.stock_quantity}</div>
          )}
          {product.category_name && (
            <div className={styles.meta}>Danh mục: {product.category_name}</div>
          )}
        </div>
      </section>
    </main>
  );
}

function formatPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return 'Liên hệ';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}
