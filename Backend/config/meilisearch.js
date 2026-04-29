const { Meilisearch } = require('meilisearch');

// Client dùng chung để backend kết nối tới Meilisearch.
// Meilisearch chạy riêng ở port 7700 và chuyên phục vụ tìm kiếm/gợi ý sản phẩm.
const meiliClient = new Meilisearch({
    host: process.env.MEILI_HOST || 'http://localhost:7700',
    apiKey: process.env.MEILI_API_KEY || 'masterKey',
});

module.exports = meiliClient;
