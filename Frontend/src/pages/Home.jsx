import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import API from '../services/api';
import styles from './Home.module.css';

export default function Home({ user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError('');
        const response = await API.get('/api/products', {
          params: { page: 1, limit: 20, search },
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

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [search]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const keyword = String(formData.get('search') || '').trim();

    if (keyword) {
      setSearchParams({ search: keyword });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchParams({});
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
              key={search}
              name="search"
              type="search"
              defaultValue={search}
              placeholder="Nhập tên hoặc mô tả sản phẩm"
            />
            <button type="submit">Tìm</button>
          </div>
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
  const imageUrl = product.image_url || product.image || product.thumbnail_url;
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
