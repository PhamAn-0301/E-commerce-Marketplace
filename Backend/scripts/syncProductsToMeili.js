require('dotenv').config();

const pool = require('../config/db');
const meiliClient = require('../config/meilisearch');

const PRODUCTS_INDEX = process.env.MEILI_PRODUCTS_INDEX || 'products';

function normalizeProduct(product) {
    return {
        ...product,
        id: String(product.id),
        price: product.price === null ? null : Number(product.price),
        category_id: product.category_id === null ? null : Number(product.category_id),
        stock_quantity: product.stock_quantity === null ? null : Number(product.stock_quantity),
    };
}

async function syncProductsToMeili() {
    const result = await pool.query(`
        SELECT *
        FROM products
        WHERE status = 'active'
        ORDER BY created_at DESC, id DESC
    `);

    const products = result.rows.map(normalizeProduct);
    const index = meiliClient.index(PRODUCTS_INDEX);

    await index.addDocuments(products, { primaryKey: 'id' });
    await index.updateSearchableAttributes(['name', 'description']);
    await index.updateFilterableAttributes(['status', 'category_id']);
    await index.updateSortableAttributes(['price', 'created_at']);

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
