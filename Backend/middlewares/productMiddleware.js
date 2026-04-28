// Middleware kiểm tra query string của API danh sách sản phẩm.
// Hàm chuẩn hóa page, limit, search, category_id rồi gắn vào req.productListQuery
// để controller/service dùng dữ liệu đã sạch thay vì đọc trực tiếp từ req.query.
function validateProductListQuery(req, res, next) {
    const page = Number.parseInt(req.query.page, 10) || 1;
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
        search: req.query.search ? String(req.query.search).trim() : '',
        categoryId: req.query.category_id ? Number(req.query.category_id) : null,
    };

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

module.exports = {
    validateProductListQuery,
    validateProductId,
};
