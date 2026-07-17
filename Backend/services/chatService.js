const chatModel = require('../models/chatModel');
const shopModel = require('../models/shopModel');

/**
 * Lấy hoặc tạo phòng chat
 */
async function getOrCreateRoom(buyerId, shopId) {
    if (!buyerId || !shopId) {
        return { error: 'Thiếu thông tin Buyer ID hoặc Shop ID.' };
    }
    try {
        const room = await chatModel.getOrCreateRoom(buyerId, shopId);
        return { success: true, room };
    } catch (error) {
        return { error: 'Không thể lấy hoặc tạo phòng chat: ' + error.message };
    }
}

/**
 * Lưu tin nhắn mới vào CSDL
 */
async function saveMessage({ roomId, senderId, senderType, messageText }) {
    if (!roomId || !senderId || !senderType || !messageText) {
        return { error: 'Thiếu thông tin tin nhắn bắt buộc.' };
    }
    try {
        const message = await chatModel.createMessage({
            roomId,
            senderId,
            senderType,
            messageText
        });
        return { success: true, message };
    } catch (error) {
        return { error: 'Không thể lưu tin nhắn: ' + error.message };
    }
}

/**
 * Tải lịch sử tin nhắn của một phòng chat
 */
async function getMessages(roomId, limit = 50, offset = 0) {
    if (!roomId) {
        return { error: 'Thiếu ID phòng chat.' };
    }
    try {
        const messages = await chatModel.getMessagesByRoomId(roomId, limit, offset);
        return { success: true, messages };
    } catch (error) {
        return { error: 'Không thể tải lịch sử tin nhắn: ' + error.message };
    }
}

/**
 * Lấy danh sách phòng chat của người dùng dựa theo vai trò (Buyer hoặc Seller)
 */
async function getUserRooms(userId, role) {
    try {
        if (role === 'seller') {
            // Nếu là Seller, trước tiên cần lấy thông tin shop của user này
            const shop = await shopModel.findByUserId(userId);
            if (!shop) {
                return { error: 'Không tìm thấy thông tin cửa hàng cho tài khoản này.' };
            }
            const rooms = await chatModel.getRoomsByShopId(shop.id);
            return { success: true, rooms };
        } else {
            // Mặc định hoặc là Buyer -> Lấy phòng chat theo buyer_id
            const rooms = await chatModel.getRoomsByBuyerId(userId);
            return { success: true, rooms };
        }
    } catch (error) {
        return { error: 'Không thể lấy danh sách phòng chat: ' + error.message };
    }
}

/**
 * Đánh dấu đã đọc tin nhắn trong phòng
 */
async function markMessagesAsRead(roomId, readerType) {
    if (!roomId || !readerType) {
        return { error: 'Thiếu thông tin phòng chat hoặc đối tượng đọc.' };
    }
    try {
        const updatedCount = await chatModel.markMessagesAsRead(roomId, readerType);
        return { success: true, updatedCount };
    } catch (error) {
        return { error: 'Không thể cập nhật trạng thái đã xem: ' + error.message };
    }
}

module.exports = {
    getOrCreateRoom,
    saveMessage,
    getMessages,
    getUserRooms,
    markMessagesAsRead
};
