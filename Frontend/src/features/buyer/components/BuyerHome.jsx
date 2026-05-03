import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from '../pages/Home.module.css';
import API from '../../../shared/services/api';

// Hiển thị ảnh suggestion (autocomplete)
function SuggestionImage({ suggestion }) {
  const imageUrl = suggestion.thumbnails;
  if (!imageUrl) {
    return <span className={styles['suggestion-placeholder']}>{suggestion.name.charAt(0)}</span>;
  }
  return <img src={imageUrl} alt={suggestion.name} />;
}

// Format giá tiền VND
function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Card sản phẩm kiểu Shopee: ảnh, tên, shop, mô tả ngắn, giá
function ProductCard({ product }) {
  const imageUrl = product.thumbnails;
  const productName = product.name || 'Sản phẩm';
  const price = formatPrice(product.min_price);
  const shopName = product.shop_name || '';

  return (
    <Link to={`/products/${product.id}`} className={styles['product-card-link']}>
      <article className={styles['product-card']}>
        <div className={styles['product-image-wrap']}>
          {imageUrl ? (
            <img src={imageUrl} alt={productName} className={styles['product-image']} />
          ) : (
            <div className={styles['product-image-placeholder']}>{productName.charAt(0)}</div>
          )}
        </div>
        <div className={styles['product-info']}>
          <h3 className={styles['product-name']}>{productName}</h3>
          {product.short_des && (
            <p className={styles['product-short-des']}>{product.short_des}</p>
          )}
          <div className={styles['product-footer']}>
            <span className={styles['product-price']}>{price}</span>
            {shopName && (
              <span className={styles['product-shop-name']}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                {shopName}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function ProductHeading({ pagination, search }) {
  return (
    <div className={styles['product-heading']}>
      <div>
        <h2>{search ? `Kết quả cho "${search}"` : 'Gợi ý hôm nay'}</h2>
        {pagination && <span>{pagination.total} sản phẩm đang hiển thị</span>}
      </div>
      <div className={styles['heading-badge']}>Mới nhất</div>
    </div>
  );
}

function ProductSection({ products, pagination, loading, error, search }) {
  if (loading) {
    return (
      <section className={styles['product-section']}>
        <ProductHeading pagination={pagination} search={search} />
        <div className={styles['product-grid']}>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className={styles['product-skeleton']} />
          ))}
        </div>
      </section>
    );
  }
  if (error) {
    return <div className={styles['product-error']}>{error}</div>;
  }
  if (!products.length) {
    return (
      <section className={styles['product-section']}>
        <ProductHeading pagination={pagination} search={search} />
        <div className={styles['product-state']}>Chưa có sản phẩm nào để hiển thị.</div>
      </section>
    );
  }
  return (
    <section className={styles['product-section']}>
      <ProductHeading pagination={pagination} search={search} />
      <div className={styles['product-grid']}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

// Giao diện trang chủ cho Buyer
export default function BuyerHome({ user }) {
  // useSearchParams giúp đọc/ghi query string trên URL.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category_id') || '';
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [searchInput, setSearchInput] = useState(search);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const suggestionCache = useRef(new Map());

  useEffect(() => {
    let isMounted = true;
    
    // Tải danh mục 1 lần khi render
    async function fetchCategories() {
      try {
        const response = await API.get('/api/categories');
        if (isMounted) setCategories(response.data.categories || []);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      }
    }
    
    async function fetchProducts() {
      try {
        setLoading(true);
        setError('');
        const response = await API.get('/api/products', {
          params: { page: 1, limit: 20, search, category_id: categoryId },
        });
        if (isMounted) {
          setProducts(response.data.products || []);
          setPagination(response.data.pagination || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Không thể tải danh sách sản phẩm.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchCategories();
    fetchProducts();
    return () => { isMounted = false; };
  }, [search, categoryId]);

  useEffect(() => {
    const keyword = searchInput.trim();
    if (keyword.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (suggestionCache.current.has(keyword)) {
        setSuggestions(suggestionCache.current.get(keyword));
        setSuggestionLoading(false);
        return;
      }
      try {
        setSuggestionLoading(true);
        const response = await API.get('/api/products/suggestions', {
          params: { q: keyword, limit: 6 },
          signal: controller.signal,
        });
        const nextSuggestions = response.data.suggestions || [];
        suggestionCache.current.set(keyword, nextSuggestions);
        setSuggestions(nextSuggestions);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          setSuggestions([]);
        }
      } finally {
        setSuggestionLoading(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchInput]);

  const handleSearchInputChange = (event) => {
    const nextValue = event.target.value;
    setSearchInput(nextValue);
    if (nextValue.trim().length < 2) {
      setSuggestions([]);
      setSuggestionLoading(false);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const keyword = searchInput.trim();
    const newParams = new URLSearchParams(searchParams);
    if (keyword) {
      newParams.set('search', keyword);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
    setSuggestions([]);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSuggestions([]);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams);
  };

  const applySuggestion = (suggestion) => {
    setSearchInput(suggestion.name);
    setSuggestions([]);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('search', suggestion.name);
    setSearchParams(newParams);
  };

  const handleCategoryClick = (id) => {
    const newParams = new URLSearchParams(searchParams);
    if (id === '') {
      newParams.delete('category_id');
    } else {
      newParams.set('category_id', id);
    }
    setSearchParams(newParams);
  };

  const displayName = user?.full_name || user?.name || user?.email;

  return (
    <div className={styles['home-container']}>
      <section className={styles['shop-hero']}>
        <div>
          <div className={styles['home-kicker']}>Marketplace hôm nay</div>
          <h1 className={styles['home-title']}>
            {displayName ? `Chào mừng, ${displayName}!` : 'Săn sản phẩm tốt mỗi ngày'}
          </h1>
          <p className={styles['home-desc']}>
            Khám phá sản phẩm đang được mở bán với giá rõ ràng và xem chi tiết nhanh.
          </p>
        </div>
        <form className={styles['search-panel']} onSubmit={handleSearchSubmit}>
          <label htmlFor="home-search">Tìm kiếm sản phẩm</label>
          <div className={styles['search-row']}>
            <input
              id="home-search"
              name="search"
              type="search"
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Nhập tên hoặc mô tả sản phẩm"
              autoComplete="off"
            />
            <button type="submit">Tìm</button>
          </div>
          {(suggestionLoading || suggestions.length > 0) && (
            <div className={styles['suggestion-box']}>
              {suggestionLoading && <div className={styles['suggestion-state']}>Đang tìm gợi ý...</div>}
              {!suggestionLoading && suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className={styles['suggestion-item']}
                  onClick={() => applySuggestion(suggestion)}
                >
                  <SuggestionImage suggestion={suggestion} />
                  <span>{suggestion.name}</span>
                  <strong>{formatPrice(suggestion.min_price)}</strong>
                </button>
              ))}
            </div>
          )}
          {search && (
            <button type="button" className={styles['clear-search']} onClick={clearSearch}>
              Xóa tìm kiếm: {search}
            </button>
          )}
        </form>
      </section>

      <div className={styles['main-content']}>
        <aside className={styles['category-sidebar']}>
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            Danh mục
          </h3>
          <ul className={styles['category-list']}>
            <li className={styles['category-item']}>
              <button
                className={`${styles['category-btn']} ${!categoryId ? styles.active : ''}`}
                onClick={() => handleCategoryClick('')}
              >
                Tất cả sản phẩm
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat.id} className={styles['category-item']}>
                <button
                  className={`${styles['category-btn']} ${String(categoryId) === String(cat.id) ? styles.active : ''}`}
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  {cat.name}
                </button>
                {cat.children && cat.children.length > 0 && (
                  <ul className={styles['subcategory-list']}>
                    {cat.children.map(sub => (
                      <li key={sub.id}>
                        <button
                          className={`${styles['subcategory-btn']} ${String(categoryId) === String(sub.id) ? styles.active : ''}`}
                          onClick={() => handleCategoryClick(sub.id)}
                        >
                          {sub.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <ProductSection
          products={products}
          pagination={pagination}
          loading={loading}
          error={error}
          search={search}
        />
      </div>
    </div>
  );
}