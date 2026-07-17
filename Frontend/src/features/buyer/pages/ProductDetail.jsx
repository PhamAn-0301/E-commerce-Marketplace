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
function ShopInfo({ product, currentUser }) {
  const shopName = product.shop_name;
  if (!shopName) return null;

  // Không hiển thị nút chat nếu là cửa hàng của chính mình
  const isOwnShop = currentUser && currentUser.role === 'seller' && currentUser.shop?.id === product.shop_id;

  const handleChat = () => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để chat với shop.');
      return;
    }
    // Gửi event để mở Widget Chat
    window.dispatchEvent(new CustomEvent('openChatWithShop', {
      detail: { shopId: product.shop_id }
    }));
  };

  return (
    <div className={styles['shop-info']} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
      
      {!isOwnShop && (
        <button
          type="button"
          onClick={handleChat}
          style={{
            background: 'white',
            border: '1.5px solid #2563eb',
            color: '#2563eb',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#eff6ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Chat ngay
        </button>
      )}
    </div>
  );
}

export default function ProductDetail({ user }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [inWishlist, setInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

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

  // Kiểm tra trạng thái wishlist mỗi khi đổi variant
  useEffect(() => {
    let isMounted = true;
    if (!product || !selectedVariant) return;

    async function checkWishlist() {
      try {
        const res = await API.get(`/api/wishlist/check/${product.id}/${selectedVariant.id}`);
        if (isMounted) setInWishlist(res.data.in_wishlist);
      } catch (err) {
        // Có thể chưa đăng nhập, bỏ qua
      }
    }
    checkWishlist();

    return () => { isMounted = false; };
  }, [product, selectedVariant]);

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

  const handleQuantityChange = (delta) => {
    let newQ = quantity + delta;
    if (newQ < 1) newQ = 1;
    if (newQ > 20) newQ = 20;
    if (displayStock && newQ > displayStock) newQ = displayStock;
    setQuantity(newQ);
  };

  const handleQuantityInput = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) return;
    if (val < 1) val = 1;
    if (val > 20) val = 20;
    if (displayStock && val > displayStock) val = displayStock;
    setQuantity(val);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setMessage({ type: 'error', text: 'Vui lòng chọn phân loại hàng.' });
      return;
    }
    setAddingToCart(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await API.post('/api/cart/add', {
        product_id: product.id,
        variant_id: selectedVariant.id,
        quantity: quantity
      });
      setMessage({ type: 'success', text: res.data.message || 'Đã thêm vào giỏ hàng!' });
      // Báo cho Navbar biết để cập nhật số lượng
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      // Bắt lỗi khi chưa đăng nhập (401, 403)
      if (err.response?.status === 401 || err.response?.status === 403) {
        setMessage({ type: 'error', text: 'Vui lòng đăng nhập để thêm vào giỏ hàng.' });
      } else {
        setMessage({ type: 'error', text: err.response?.data?.error || 'Lỗi thêm giỏ hàng.' });
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!selectedVariant) {
      setMessage({ type: 'error', text: 'Vui lòng chọn phân loại hàng.' });
      return;
    }
    setTogglingWishlist(true);
    try {
      const res = await API.post('/api/wishlist/toggle', {
        product_id: product.id,
        variant_id: selectedVariant.id
      });
      setInWishlist(res.data.in_wishlist);
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setMessage({ type: 'error', text: 'Vui lòng đăng nhập để thêm vào yêu thích.' });
      } else {
        setMessage({ type: 'error', text: 'Lỗi cập nhật danh sách yêu thích.' });
      }
    } finally {
      setTogglingWishlist(false);
    }
  };

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
          <ShopInfo product={product} currentUser={user} />

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

          {/* Số lượng tồn kho & Input số lượng */}
          <div className={styles.quantitySection}>
            <span className={styles.quantityLabel}>Số lượng:</span>
            <div className={styles.quantityControl}>
              <button 
                type="button" 
                className={styles.qtyBtn} 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >-</button>
              <input 
                type="text" 
                className={styles.qtyInput} 
                value={quantity} 
                onChange={handleQuantityInput} 
              />
              <button 
                type="button" 
                className={styles.qtyBtn} 
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 20 || quantity >= displayStock}
              >+</button>
            </div>
            {displayStock !== null && displayStock !== undefined && (
              <span className={styles.stockValue}>{displayStock} sản phẩm có sẵn</span>
            )}
          </div>
          
          {message.text && (
            <div className={`${styles.actionMessage} ${message.type === 'error' ? styles.msgError : styles.msgSuccess}`}>
              {message.text}
            </div>
          )}

          {/* Nút hành động */}
          {(!user || user.role !== 'seller') && (
            <div className={styles.actions}>
              <button 
                type="button" 
                className={styles.addToCart} 
                onClick={handleAddToCart}
                disabled={addingToCart || displayStock < 1}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Thêm vào giỏ hàng
              </button>
              <button type="button" className={styles.buyNow}>
                Mua ngay
              </button>
              <button 
                type="button" 
                className={`${styles.wishlistBtn} ${inWishlist ? styles.activeWishlist : ''}`}
                onClick={handleToggleWishlist}
                disabled={togglingWishlist || !selectedVariant}
                title={inWishlist ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
          )}
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
