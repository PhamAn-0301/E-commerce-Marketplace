const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/authMiddleware');

// Route mẫu để kiểm tra middleware JWT.
// Nếu token hợp lệ thì authenticateJWT gắn req.user và handler trả thông tin user.
router.get('/', authenticateJWT, (req, res) => {
    res.json({ message: 'Bạn đã truy cập thành công route bảo vệ!', user: req.user });
});

module.exports = router;
