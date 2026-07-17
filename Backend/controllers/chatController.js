const chatService = require('../services/chatService');

/**
 * Lấy hoặc tạo phòng chat
 */
async function getOrCreateRoom(req, res) {
    const buyerId = req.user.id;
    const { shopId } = req.body;

    if (!shopId) {
        return res.status(400).json({ error: 'Vui lòng cung cấp Shop ID.' });
    }

    const result = await chatService.getOrCreateRoom(buyerId, Number(shopId));
    if (result.error) {
        return res.status(500).json({ error: result.error });
    }
    return res.status(200).json(result.room);
}

/**
 * Lấy danh sách các cuộc trò chuyện của user hiện tại
 */
async function getUserRooms(req, res) {
    const userId = req.user.id;
    const role = req.user.role; // 'buyer' hoặc 'seller'

    const result = await chatService.getUserRooms(userId, role);
    if (result.error) {
        return res.status(500).json({ error: result.error });
    }
    return res.status(200).json(result.rooms);
}

/**
 * Lấy lịch sử tin nhắn trong một phòng chat
 */
async function getMessages(req, res) {
    const { roomId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    const result = await chatService.getMessages(Number(roomId), limit, offset);
    if (result.error) {
        return res.status(500).json({ error: result.error });
    }
    return res.status(200).json(result.messages);
}

/**
 * Đánh dấu tin nhắn trong phòng chat đã đọc
 */
async function markAsRead(req, res) {
    const { roomId } = req.params;
    const role = req.user.role; // 'buyer' hoặc 'seller'

    // Xác định đối tượng đọc là 'buyer' hay 'shop' (seller tương ứng với shop)
    const readerType = role === 'seller' ? 'shop' : 'buyer';

    const result = await chatService.markMessagesAsRead(Number(roomId), readerType);
    if (result.error) {
        return res.status(500).json({ error: result.error });
    }
    return res.status(200).json({ success: true, updatedCount: result.updatedCount });
}

module.exports = {
    getOrCreateRoom,
    getUserRooms,
    getMessages,
    markAsRead
};
