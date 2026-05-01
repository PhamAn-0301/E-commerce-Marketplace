require('dotenv').config({ path: __dirname + '/../.env' });

const pool = require('../config/db');
const meiliClient = require('../config/meilisearch');

const PRODUCTS_INDEX = process.env.MEILI_PRODUCTS_INDEX || 'products';

function normalizeProduct(product) {
    return {
        ...product,
        id: String(product.id),
        min_price: product.min_price === null ? null : Number(product.min_price),
        category_id: product.category_id === null ? null : Number(product.category_id),
        total_stock: product.total_stock === null ? null : Number(product.total_stock),
        shop_id: product.shop_id === null ? null : Number(product.shop_id),
    };
}

async function syncProductsToMeili() {
    // JOIN với bảng shops để sync thêm shop_name vào Meilisearch
    const result = await pool.query(`
        SELECT p.*, s.shop_name
        FROM products p
        LEFT JOIN shops s ON p.shop_id = s.id
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC, p.id DESC
    `);

    const products = result.rows.map(normalizeProduct);
    const index = meiliClient.index(PRODUCTS_INDEX);

    // Xóa toàn bộ dữ liệu cũ trên Meilisearch trước khi thêm mới
    await index.deleteAllDocuments();
    await index.addDocuments(products, { primaryKey: 'id' });
    await index.updateSearchableAttributes(['name', 'short_des', 'full_des']);
    await index.updateFilterableAttributes(['status', 'category_id', 'shop_id']);
    await index.updateSortableAttributes(['min_price', 'created_at', 'total_stock']);

    console.log(`Synced ${products.length} products to Meilisearch index "${PRODUCTS_INDEX}".`);
}

syncProductsToMeili()
    .catch((err) => {
        console.error('Failed to sync products to Meilisearch:', err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
