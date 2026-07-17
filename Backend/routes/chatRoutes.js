const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/authMiddleware');
const chatController = require('../controllers/chatController');

// Tất cả các route chat đều yêu cầu xác thực JWT (đăng nhập)
router.post('/room', authenticateJWT, chatController.getOrCreateRoom);
router.get('/rooms', authenticateJWT, chatController.getUserRooms);
router.get('/rooms/:roomId/messages', authenticateJWT, chatController.getMessages);
router.post('/rooms/:roomId/read', authenticateJWT, chatController.markAsRead);

module.exports = router;
