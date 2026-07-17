-- ==========================================
-- SQL Script: Tạo bảng cho hệ thống chat real-time
-- CSDL: PostgreSQL
-- ==========================================

-- 1. Tạo bảng quản lý Phòng chat (chat_rooms)
-- Mỗi phòng đại diện cho cuộc trò chuyện giữa 1 Người mua và 1 Shop
CREATE TABLE IF NOT EXISTS chat_rooms (
    id SERIAL PRIMARY KEY,
    buyer_id INT NOT NULL,
    shop_id INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Khóa ngoại liên kết tới bảng "users" (Người mua)
    CONSTRAINT fk_chat_rooms_buyer 
        FOREIGN KEY (buyer_id) 
        REFERENCES "users"(id) 
        ON DELETE CASCADE,
        
    -- Khóa ngoại liên kết tới bảng "shops" (Cửa hàng)
    CONSTRAINT fk_chat_rooms_shop 
        FOREIGN KEY (shop_id) 
        REFERENCES "shops"(id) 
        ON DELETE CASCADE,
        
    -- Đảm bảo 1 Người mua và 1 Shop chỉ có duy nhất 1 cuộc hội thoại
    CONSTRAINT uq_buyer_shop 
        UNIQUE (buyer_id, shop_id)
);

-- 2. Tạo bảng lưu trữ Tin nhắn (chat_messages)
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    sender_id INT NOT NULL,
    
    -- Phân biệt vai trò khi gửi tin nhắn: 'buyer' hoặc 'shop'
    sender_type VARCHAR(10) NOT NULL,
    
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Khóa ngoại liên kết tới bảng phòng chat
    CONSTRAINT fk_chat_messages_room 
        FOREIGN KEY (room_id) 
        REFERENCES chat_rooms(id) 
        ON DELETE CASCADE,
        
    -- Khóa ngoại liên kết tới bảng "users" để biết ai gửi tin nhắn
    CONSTRAINT fk_chat_messages_sender 
        FOREIGN KEY (sender_id) 
        REFERENCES "users"(id) 
        ON DELETE CASCADE,
        
    -- Ràng buộc kiểm tra loại người gửi
    CONSTRAINT chk_sender_type 
        CHECK (sender_type IN ('buyer', 'shop'))
);

-- 3. Tạo các chỉ mục (Indexes) để tối ưu hóa tốc độ truy vấn sau này
-- Giúp tìm kiếm phòng chat nhanh hơn theo người mua hoặc cửa hàng
CREATE INDEX IF NOT EXISTS idx_chat_rooms_buyer ON chat_rooms(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_shop ON chat_rooms(shop_id);

-- Giúp tải lịch sử tin nhắn trong phòng chat cực nhanh theo thời gian giảm dần
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(room_id, created_at DESC);
