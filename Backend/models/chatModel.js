const pool = require('../config/db');

/**
 * Lấy hoặc tạo mới phòng chat giữa Buyer và Shop
 */
async function getOrCreateRoom(buyerId, shopId) {
    // 1. Tìm phòng chat đã có sẵn
    let result = await pool.query(
        'SELECT id, buyer_id, shop_id, created_at, updated_at FROM chat_rooms WHERE buyer_id = $1 AND shop_id = $2',
        [buyerId, shopId]
    );
    let room = result.rows[0];

    // 2. Nếu chưa có phòng chat -> Tiến hành tạo mới
    if (!room) {
        result = await pool.query(
            'INSERT INTO chat_rooms (buyer_id, shop_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id, buyer_id, shop_id, created_at, updated_at',
            [buyerId, shopId]
        );
        room = result.rows[0];
    }
    return room;
}

/**
 * Tạo/lưu một tin nhắn mới
 */
async function createMessage({ roomId, senderId, senderType, messageText }) {
    // Sử dụng transaction để vừa lưu tin nhắn, vừa cập nhật thời gian hoạt động mới nhất cho phòng chat (updated_at)
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert tin nhắn vào bảng chat_messages
        const msgResult = await client.query(
            `INSERT INTO chat_messages (room_id, sender_id, sender_type, message_text, is_read, created_at) 
             VALUES ($1, $2, $3, $4, FALSE, NOW()) 
             RETURNING id, room_id, sender_id, sender_type, message_text, is_read, created_at`,
            [roomId, senderId, senderType, messageText]
        );
        const newMessage = msgResult.rows[0];

        // 2. Cập nhật updated_at ở bảng chat_rooms để đẩy phòng chat có tin nhắn mới lên đầu danh sách
        await client.query(
            'UPDATE chat_rooms SET updated_at = NOW() WHERE id = $1',
            [roomId]
        );

        await client.query('COMMIT');
        return newMessage;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Tải lịch sử tin nhắn của một phòng chat
 * Trả về tin nhắn theo thứ tự thời gian tăng dần (cũ đến mới) để hiển thị trong khung chat
 */
async function getMessagesByRoomId(roomId, limit = 50, offset = 0) {
    const query = `
        SELECT id, room_id, sender_id, sender_type, message_text, is_read, created_at 
        FROM chat_messages 
        WHERE room_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [roomId, limit, offset]);
    // Đảo ngược mảng để tin nhắn hiển thị từ cũ đến mới
    return result.rows.reverse();
}

/**
 * Lấy danh sách các cuộc trò chuyện của một Người mua (Buyer)
 * Sẽ join với bảng shops để biết họ đang nhắn tin cho những shop nào
 */
async function getRoomsByBuyerId(buyerId) {
    const query = `
        SELECT 
            cr.id as room_id, 
            cr.buyer_id, 
            cr.shop_id, 
            cr.updated_at,
            s.shop_name,
            -- Lấy nội dung tin nhắn mới nhất trong phòng
            (SELECT message_text FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message,
            -- Lấy thời gian của tin nhắn mới nhất
            (SELECT created_at FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
            -- Đếm số tin nhắn chưa đọc đối với người mua
            (SELECT COUNT(*)::int FROM chat_messages WHERE room_id = cr.id AND sender_type = 'shop' AND is_read = FALSE) as unread_count
        FROM chat_rooms cr
        JOIN shops s ON cr.shop_id = s.id
        WHERE cr.buyer_id = $1
        ORDER BY cr.updated_at DESC
    `;
    const result = await pool.query(query, [buyerId]);
    return result.rows;
}

/**
 * Lấy danh sách các cuộc trò chuyện của một Cửa hàng (Shop)
 * Sẽ join với bảng users để biết khách hàng nào đang nhắn tin tới
 */
async function getRoomsByShopId(shopId) {
    const query = `
        SELECT 
            cr.id as room_id, 
            cr.buyer_id, 
            cr.shop_id, 
            cr.updated_at,
            u.full_name as buyer_name,
            u.email as buyer_email,
            -- Lấy tin nhắn mới nhất
            (SELECT message_text FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message,
            -- Lấy thời gian của tin nhắn mới nhất
            (SELECT created_at FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
            -- Đếm số tin nhắn chưa đọc đối với shop (người gửi là buyer)
            (SELECT COUNT(*)::int FROM chat_messages WHERE room_id = cr.id AND sender_type = 'buyer' AND is_read = FALSE) as unread_count
        FROM chat_rooms cr
        JOIN "users" u ON cr.buyer_id = u.id
        WHERE cr.shop_id = $1
        ORDER BY cr.updated_at DESC
    `;
    const result = await pool.query(query, [shopId]);
    return result.rows;
}

/**
 * Đánh dấu đã đọc các tin nhắn của một phòng chat dựa trên người đọc
 */
async function markMessagesAsRead(roomId, readerType) {
    // Nếu người đọc là 'buyer' -> Đánh dấu các tin nhắn do 'shop' gửi là đã đọc
    // Nếu người đọc là 'shop' -> Đánh dấu các tin nhắn do 'buyer' gửi là đã đọc
    const senderTypeToUpdate = readerType === 'buyer' ? 'shop' : 'buyer';
    
    const query = `
        UPDATE chat_messages 
        SET is_read = TRUE 
        WHERE room_id = $1 AND sender_type = $2 AND is_read = FALSE
        RETURNING id
    `;
    const result = await pool.query(query, [roomId, senderTypeToUpdate]);
    return result.rowCount;
}

module.exports = {
    getOrCreateRoom,
    createMessage,
    getMessagesByRoomId,
    getRoomsByBuyerId,
    getRoomsByShopId,
    markMessagesAsRead
};
