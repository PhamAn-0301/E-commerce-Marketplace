// Middleware kiểm tra query string của API danh sách sản phẩm.
// Hàm chuẩn hóa page, limit, search, category_id rồi gắn vào req.productListQuery
// để controller/service dùng dữ liệu đã sạch thay vì đọc trực tiếp từ req.query.
function validateProductListQuery(req, res, next) {
    // req.query.page lấy từ URL, ví dụ /api/products?page=2.
    // Nếu frontend không gửi page thì mặc định page = 1.
    const page = Number.parseInt(req.query.page, 10) || 1;
    // req.query.limit lấy từ URL, ví dụ /api/products?limit=20.
    // Nếu không gửi thì mặc định lấy 12 sản phẩm.
    const limit = Number.parseInt(req.query.limit, 10) || 12;

    if (page < 1) {
        return res.status(400).json({ error: 'page phải lớn hơn hoặc bằng 1' });
    }

    if (limit < 1 || limit > 50) {
        return res.status(400).json({ error: 'limit phải nằm trong khoảng 1 đến 50' });
    }

    if (req.query.category_id && !Number.isInteger(Number(req.query.category_id))) {
        return res.status(400).json({ error: 'category_id không hợp lệ' });
    }

    req.productListQuery = {
        page,
        limit,
        // search lấy từ URL /api/products?search=bottle.
        // trim để bỏ khoảng trắng thừa trước khi service dùng.
        search: req.query.search ? String(req.query.search).trim() : '',
        // category_id trên URL dùng snake_case, service/model dùng categoryId camelCase.
        categoryId: req.query.category_id ? Number(req.query.category_id) : null,
    };

    // next() cho request đi tiếp sang controller.
    next();
}

// Middleware kiểm tra params id của API chi tiết sản phẩm.
// Nếu id không phải số nguyên dương thì trả 400; nếu hợp lệ thì gắn vào req.productId.
function validateProductId(req, res, next) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'id sản phẩm không hợp lệ' });
    }

    req.productId = id;
    next();
}

// Middleware kiểm tra query của API gợi ý sản phẩm.
// q là từ khóa người dùng đang gõ, limit giới hạn số gợi ý trả về để API nhẹ.
function validateProductSuggestionQuery(req, res, next) {
    // q lấy từ URL /api/products/suggestions?q=bottle.
    // Đổi sang string và trim để service nhận keyword sạch.
    const keyword = req.query.q ? String(req.query.q).trim() : '';
    // limit giới hạn số gợi ý dropdown; mặc định 6, tối đa 10.
    const limit = Number.parseInt(req.query.limit, 10) || 6;

    if (keyword && keyword.length > 100) {
        return res.status(400).json({ error: 'Từ khóa gợi ý quá dài' });
    }

    if (limit < 1 || limit > 10) {
        return res.status(400).json({ error: 'limit gợi ý phải nằm trong khoảng 1 đến 10' });
    }

    req.productSuggestionQuery = {
        keyword,
        limit,
    };

    // Sau khi chuẩn hóa keyword/limit, controller sẽ dùng req.productSuggestionQuery.
    next();
}

module.exports = {
    validateProductListQuery,
    validateProductId,
    validateProductSuggestionQuery,
};
