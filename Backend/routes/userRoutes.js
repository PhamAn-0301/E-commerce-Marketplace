const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRole } = require('../middlewares/authMiddleware');
const UserController = require('../controllers/userController');

// Tất cả route dưới đây đều yêu cầu đăng nhập (authenticateJWT).
// GET  /api/user/profile  → lấy thông tin profile
// PUT  /api/user/profile  → cập nhật full_name, phone
// PUT  /api/user/password → đổi mật khẩu (cần mật khẩu cũ)
// PUT  /api/user/shop     → cập nhật shop (chỉ seller)

router.get('/profile', authenticateJWT, UserController.getProfile);
router.put('/profile', authenticateJWT, UserController.updateProfile);
router.put('/password', authenticateJWT, UserController.changePassword);
router.put('/shop', authenticateJWT, authorizeRole('seller'), UserController.updateShop);

module.exports = router;
