import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import API from '../../../shared/services/api';
import styles from './ProductDetail.module.css';

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Hiển thị khoảng giá nếu có nhiều variant
function PriceDisplay({ product }) {
  const variants = product.variants || [];

  if (variants.length > 0) {
    const prices = variants.map(v => Number(v.price)).filter(Number.isFinite);
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        return <span>{formatPrice(minPrice)}</span>;
      }
      return <span>{formatPrice(minPrice)} - {formatPrice(maxPrice)}</span>;
    }
  }

  return <span>{formatPrice(product.min_price)}</span>;
}

// Component chọn variant (size, color)
function VariantSelector({ variants, selectedVariant, onSelect }) {
  if (!variants || variants.length === 0) return null;

  // Nhóm attributes từ variants
  // Mỗi variant có attribute: { size: "M", color: "black" }
  const attributeKeys = new Set();
  variants.forEach(v => {
    if (v.attribute && typeof v.attribute === 'object') {
      Object.keys(v.attribute).forEach(k => attributeKeys.add(k));
    }
  });

  return (
    <div className={styles.variants}>
      <h3 className={styles['variants-title']}>Phân loại hàng</h3>
      <div className={styles['variant-list']}>
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const label = variant.name || Object.values(variant.attribute || {}).join(' - ');
          return (
            <button
              key={variant.id}
              type="button"
              className={`${styles['variant-btn']} ${isSelected ? styles['variant-btn-active'] : ''}`}
              onClick={() => onSelect(variant)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Thông tin shop
function ShopInfo({ product }) {
  const shopName = product.shop_name;
  if (!shopName) return null;

  return (
    <div className={styles['shop-info']}>
      <div className={styles['shop-avatar']}>
        {shopName.charAt(0).toUpperCase()}
      </div>
      <div className={styles['shop-details']}>
        <span className={styles['shop-name']}>{shopName}</span>
        {product.shop_description && (
          <span className={styles['shop-desc']}>{product.shop_description}</span>
        )}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError('');
        const response = await API.get(`/api/products/${id}`);

        if (isMounted) {
          const data = response.data.product;
          setProduct(data);
          // Tự động chọn variant đầu tiên nếu có
          if (data?.variants?.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
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
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingSkeleton}>
          <div className={styles.loadingImage} />
          <div className={styles.loadingContent}>
            <div className={styles.loadingLine} style={{ width: '80%', height: '24px' }} />
            <div className={styles.loadingLine} style={{ width: '40%', height: '32px' }} />
            <div className={styles.loadingLine} style={{ width: '60%', height: '16px' }} />
            <div className={styles.loadingLine} style={{ width: '100%', height: '16px' }} />
          </div>
        </div>
      </div>
    );
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

  const imageUrl = product.thumbnails;
  const productName = product.name || 'Sản phẩm';
  const variants = product.variants || [];

  // Giá và tồn kho theo variant đang chọn
  const displayPrice = selectedVariant ? formatPrice(selectedVariant.price) : null;
  const displayStock = selectedVariant ? selectedVariant.stock : product.total_stock;

  return (
    <main className={styles.detail}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/">Trang chủ</Link>
        <span className={styles.breadcrumbSep}>›</span>
        {product.category_name && (
          <>
            <span>{product.category_name}</span>
            <span className={styles.breadcrumbSep}>›</span>
          </>
        )}
        <span className={styles.breadcrumbCurrent}>{productName}</span>
      </nav>

      {/* Product main section */}
      <section className={styles.product}>
        {/* Ảnh sản phẩm */}
        <div className={styles.media}>
          {imageUrl ? (
            <img src={imageUrl} alt={productName} />
          ) : (
            <div className={styles.placeholder}>{productName.charAt(0)}</div>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div className={styles.content}>
          <h1 className={styles.productTitle}>{productName}</h1>

          {/* Giá sản phẩm */}
          <div className={styles.priceSection}>
            {selectedVariant ? (
              <span className={styles.priceMain}>{displayPrice}</span>
            ) : (
              <span className={styles.priceMain}>
                <PriceDisplay product={product} />
              </span>
            )}
          </div>

          {/* Thông tin shop */}
          <ShopInfo product={product} />

          {/* Mô tả ngắn */}
          {product.short_des && (
            <p className={styles.shortDes}>{product.short_des}</p>
          )}

          {/* Chọn variant */}
          <VariantSelector
            variants={variants}
            selectedVariant={selectedVariant}
            onSelect={setSelectedVariant}
          />

          {/* Số lượng tồn kho */}
          {displayStock !== null && displayStock !== undefined && (
            <div className={styles.stockInfo}>
              <span className={styles.stockLabel}>Kho hàng:</span>
              <span className={styles.stockValue}>{displayStock} sản phẩm có sẵn</span>
            </div>
          )}

          {/* Nút hành động */}
          <div className={styles.actions}>
            <button type="button" className={styles.addToCart}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Thêm vào giỏ hàng
            </button>
            <button type="button" className={styles.buyNow}>
              Mua ngay
            </button>
          </div>
        </div>
      </section>

      {/* Mô tả chi tiết */}
      {product.full_des && (
        <section className={styles.descriptionSection}>
          <h2 className={styles.descriptionTitle}>Mô tả sản phẩm</h2>
          <div className={styles.descriptionContent}>
            {product.full_des}
          </div>
        </section>
      )}
    </main>
  );
}
