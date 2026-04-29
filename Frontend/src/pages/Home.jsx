import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import API from '../services/api';
import styles from './Home.module.css';

export default function Home({ user }) {
  // useSearchParams giúp đọc/ghi query string trên URL.
  // Ví dụ URL /?search=bottle thì searchParams.get('search') sẽ trả "bottle".
  const [searchParams, setSearchParams] = useSearchParams();
  // search là từ khóa chính thức trên URL, dùng để gọi API danh sách sản phẩm.
  const search = searchParams.get('search') || '';
  // products là danh sách sản phẩm đang hiển thị trên trang chủ.
  const [products, setProducts] = useState([]);
  // pagination là thông tin phân trang backend trả về: page, limit, total, totalPages.
  const [pagination, setPagination] = useState(null);
  // searchInput là chữ người dùng đang gõ trong ô tìm kiếm.
  // Nó khác search: searchInput thay đổi từng phím, search chỉ đổi khi submit/click gợi ý.
  const [searchInput, setSearchInput] = useState(search);
  // suggestions là danh sách gợi ý autocomplete lấy từ /api/products/suggestions.
  const [suggestions, setSuggestions] = useState([]);
  // suggestionLoading dùng để hiện "Đang tìm gợi ý..." trong dropdown.
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  // loading/error dùng cho API danh sách sản phẩm chính.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // suggestionCache lưu lại kết quả gợi ý đã gọi trước đó.
  // Ví dụ đã gọi keyword "bottle", lần sau gõ lại "bottle" thì lấy cache, không gọi API nữa.
  const suggestionCache = useRef(new Map());

  // Effect này chạy khi search trên URL thay đổi.
  // Nó chịu trách nhiệm gọi API /api/products để lấy danh sách sản phẩm theo keyword hiện tại.
  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError('');
        // API là axios instance có baseURL http://localhost:3000.
        // params sẽ được axios chuyển thành query string:
        // /api/products?page=1&limit=20&search=bottle.
        const response = await API.get('/api/products', {
          params: { page: 1, limit: 20, search },
        });

        if (isMounted) {
          // Backend trả response.data.products và response.data.pagination.
          // setProducts làm React render lại ProductSection/ProductCard.
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

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [search]);

  // Effect này chạy khi searchInput thay đổi, tức là người dùng đang gõ.
  // Nó chỉ phục vụ autocomplete, không đổi danh sách sản phẩm chính.
  useEffect(() => {
    const keyword = searchInput.trim();

    // Dưới 2 ký tự thì không gọi API gợi ý để tránh query quá rộng.
    if (keyword.length < 2) {
      return;
    }

    // AbortController dùng để hủy request cũ nếu user gõ tiếp trước khi request hoàn tất.
    // Điều này tránh việc response cũ trả về sau và ghi đè dropdown mới.
    const controller = new AbortController();
    // setTimeout 300ms là debounce: user ngừng gõ 300ms mới gọi API.
    // Nếu user gõ tiếp, cleanup bên dưới clearTimeout timer cũ.
    const timer = setTimeout(async () => {
      // Nếu keyword đã có trong cache thì dùng lại luôn, không gọi backend.
      if (suggestionCache.current.has(keyword)) {
        setSuggestions(suggestionCache.current.get(keyword));
        setSuggestionLoading(false);
        return;
      }

      try {
        setSuggestionLoading(true);
        // Gọi API gợi ý từ backend.
        // q là keyword người dùng đang gõ; limit giới hạn số gợi ý dropdown.
        const response = await API.get('/api/products/suggestions', {
          params: { q: keyword, limit: 6 },
          // signal cho phép abort request khi keyword đổi.
          signal: controller.signal,
        });
        const nextSuggestions = response.data.suggestions || [];
        // Lưu cache theo keyword để lần sau khỏi gọi lại API.
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
      // Cleanup chạy trước khi effect mới chạy hoặc component unmount.
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchInput]);

  // Hàm này chạy mỗi lần user gõ trong ô input.
  // Nó cập nhật searchInput để effect autocomplete phía trên có keyword mới.
  const handleSearchInputChange = (event) => {
    const nextValue = event.target.value;
    setSearchInput(nextValue);

    // Khi input dưới 2 ký tự thì xóa dropdown để tránh hiện gợi ý cũ.
    if (nextValue.trim().length < 2) {
      setSuggestions([]);
      setSuggestionLoading(false);
    }
  };

  // Hàm này chạy khi user bấm nút "Tìm" hoặc Enter.
  // Nó đưa keyword từ input lên URL query string, ví dụ /?search=bottle.
  // Khi URL đổi, effect fetchProducts sẽ gọi lại API danh sách sản phẩm.
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const keyword = searchInput.trim();

    if (keyword) {
      setSearchParams({ search: keyword });
    } else {
      setSearchParams({});
    }

    // Submit xong thì đóng dropdown gợi ý.
    setSuggestions([]);
  };

  // Xóa keyword khỏi input và khỏi URL, làm trang quay lại danh sách mặc định.
  const clearSearch = () => {
    setSearchInput('');
    setSuggestions([]);
    setSearchParams({});
  };

  // Khi click một gợi ý, dùng name của sản phẩm làm keyword chính thức.
  // setSearchParams sẽ đổi URL và kích hoạt fetchProducts theo keyword đó.
  const applySuggestion = (suggestion) => {
    setSearchInput(suggestion.name);
    setSuggestions([]);
    setSearchParams({ search: suggestion.name });
  };

  if (user?.role === 'seller') {
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
  if (user?.role === 'admin') {
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
                  <strong>{formatPrice(suggestion.price)}</strong>
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
      <ProductSection
        products={products}
        pagination={pagination}
        loading={loading}
        error={error}
        search={search}
      />
    </div>
  );
}

function ProductSection({ products, pagination, loading, error, search }) {
  // Trong lúc chờ API danh sách sản phẩm, hiện skeleton để giao diện không bị trống.
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
    return <div className={styles['product-state']}>Chưa có sản phẩm nào để hiển thị.</div>;
  }

  return (
    <section className={styles['product-section']}>
      <ProductHeading pagination={pagination} search={search} />
      <div className={styles['product-grid']}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
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

function ProductCard({ product }) {
  // Sản phẩm từ PostgreSQL và Meilisearch có thể khác tên field ảnh.
  // Dòng này chọn field ảnh nào có dữ liệu trước.
  const imageUrl = product.image_url || product.image || product.thumbnail_url || product.thumbnail;
  const productName = product.name || product.title || 'Sản phẩm';
  const price = formatPrice(product.price);
  const stock = product.stock_quantity ?? product.stock ?? null;

  return (
    <article className={styles['product-card']}>
      <div className={styles['product-image-wrap']}>
        <div className={styles['sale-tag']}>Mall</div>
        {imageUrl ? (
          <img src={imageUrl} alt={productName} className={styles['product-image']} />
        ) : (
          <div className={styles['product-image-placeholder']}>{productName.charAt(0)}</div>
        )}
      </div>
      <div className={styles['product-info']}>
        <h3>{productName}</h3>
        <p>{product.description || 'Sản phẩm đang được mở bán.'}</p>
        <div className={styles['product-meta']}>
          <span>Yêu thích</span>
          {stock !== null && <span>Còn {stock}</span>}
        </div>
        <div className={styles['product-footer']}>
          <span className={styles['product-price']}>{price}</span>
          <Link to={`/products/${product.id}`}>
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}

function SuggestionImage({ suggestion }) {
  // Gợi ý từ Meilisearch có thể trả thumbnail/image_url tùy dữ liệu đã sync.
  const imageUrl = suggestion.image_url || suggestion.thumbnail_url || suggestion.thumbnail;

  if (!imageUrl) {
    return <span className={styles['suggestion-placeholder']}>{suggestion.name.charAt(0)}</span>;
  }

  return <img src={imageUrl} alt={suggestion.name} />;
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
