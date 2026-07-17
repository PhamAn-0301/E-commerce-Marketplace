import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import API from '../../services/api';
import './ChatWidget.css';

export default function ChatWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [unreadTotal, setUnreadTotal] = useState(0);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeRoomRef = useRef(null); // Sử dụng ref để giữ giá trị activeRoom mới nhất cho callback socket

  // Đồng bộ activeRoomRef với activeRoom state
  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  // 1. Quản lý kết nối Socket.io
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Kết nối tới WebSocket server
    socketRef.current = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected to server.');
      // Tải danh sách phòng chat ngay khi kết nối thành công
      fetchRooms();
    });

    // Lắng nghe tin nhắn mới từ Server
    socketRef.current.on('receive_message', (message) => {
      console.log('[Socket] Received message:', message);
      
      const currentActiveRoom = activeRoomRef.current;

      // TH1: Tin nhắn thuộc phòng đang mở chat
      if (currentActiveRoom && currentActiveRoom.room_id === message.room_id) {
        setMessages((prev) => [...prev, message]);
        // Tự động đánh dấu đã đọc trên Backend
        API.post(`/api/chat/rooms/${message.room_id}/read`).catch((err) => console.error(err));
      }

      // Cập nhật lại danh sách phòng (last message, unread count)
      setRooms((prevRooms) => {
        const updatedRooms = prevRooms.map((room) => {
          if (room.room_id === message.room_id) {
            const isOwnMessage = message.sender_id === user.id;
            const newUnreadCount = (currentActiveRoom && currentActiveRoom.room_id === message.room_id) || isOwnMessage
              ? 0
              : (room.unread_count || 0) + 1;

            return {
              ...room,
              last_message: message.message_text,
              last_message_time: message.created_at,
              unread_count: newUnreadCount
            };
          }
          return room;
        });

        // Đẩy phòng chat có tin nhắn mới lên đầu danh sách
        return [...updatedRooms].sort((a, b) => new Date(b.last_message_time || b.updated_at) - new Date(a.last_message_time || a.updated_at));
      });
    });

    socketRef.current.on('error_message', (err) => {
      console.error('[Socket Error]:', err);
    });

    // Cleanup khi component unmount hoặc user logout
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  // Tính tổng số lượng tin nhắn chưa đọc để hiện Badge thông báo
  useEffect(() => {
    const total = rooms.reduce((acc, room) => acc + (room.unread_count || 0), 0);
    setUnreadTotal(total);
  }, [rooms]);

  // Tự động cuộn xuống cuối khung chat khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Lắng nghe sự kiện click "Chat ngay" từ trang ProductDetail
  useEffect(() => {
    const handleOpenChat = async (e) => {
      const { shopId } = e.detail;
      if (!user) {
        alert('Vui lòng đăng nhập để sử dụng chức năng chat.');
        return;
      }
      setIsOpen(true);

      try {
        // Gọi API lấy hoặc tạo phòng chat với shopId
        const res = await API.post('/api/chat/room', { shopId });
        const room = res.data;

        // Định dạng lại object room tương ứng cấu trúc danh sách
        const formattedRoom = {
          room_id: room.id,
          buyer_id: room.buyer_id,
          shop_id: room.shop_id,
          updated_at: room.updated_at,
          shop_name: room.shop_name || 'Cửa hàng',
          unread_count: 0
        };

        // Cập nhật phòng chat vào danh sách (nếu chưa có thì chèn lên đầu)
        setRooms((prev) => {
          const exists = prev.some((r) => r.room_id === formattedRoom.room_id);
          if (exists) {
            // Đưa lên đầu
            return [formattedRoom, ...prev.filter((r) => r.room_id !== formattedRoom.room_id)];
          }
          return [formattedRoom, ...prev];
        });

        // Mở phòng chat vừa tạo/lấy
        handleSelectRoom(formattedRoom);
      } catch (err) {
        console.error('Không thể tạo phòng chat:', err);
      }
    };

    window.addEventListener('openChatWithShop', handleOpenChat);
    return () => {
      window.removeEventListener('openChatWithShop', handleOpenChat);
    };
  }, [user]);

  // 2. Các hàm tương tác API
  const fetchRooms = async () => {
    try {
      const res = await API.get('/api/chat/rooms');
      // Sắp xếp các phòng chat theo thời gian tin nhắn mới nhất
      const sortedRooms = res.data.sort((a, b) => new Date(b.last_message_time || b.updated_at) - new Date(a.last_message_time || a.updated_at));
      setRooms(sortedRooms);
    } catch (err) {
      console.error('Không thể lấy danh sách phòng chat:', err);
    }
  };

  const handleSelectRoom = async (room) => {
    // Rời phòng cũ trên Socket (nếu có)
    if (activeRoom && socketRef.current) {
      socketRef.current.emit('leave_room', activeRoom.room_id);
    }

    setActiveRoom(room);
    setMessages([]);

    // Vào phòng mới trên Socket
    if (socketRef.current) {
      socketRef.current.emit('join_room', room.room_id);
    }

    try {
      // 1. Tải lịch sử tin nhắn
      const res = await API.get(`/api/chat/rooms/${room.room_id}/messages`);
      setMessages(res.data);

      // 2. Đánh dấu đã đọc
      if (room.unread_count > 0) {
        await API.post(`/api/chat/rooms/${room.room_id}/read`);
        // Cập nhật lại unread_count trên UI
        setRooms((prev) =>
          prev.map((r) => (r.room_id === room.room_id ? { ...r, unread_count: 0 } : r))
        );
      }
    } catch (err) {
      console.error('Lỗi khi tải phòng chat:', err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoom || !socketRef.current) return;

    const senderType = user.role === 'seller' ? 'shop' : 'buyer';

    // Gửi event qua WebSocket
    socketRef.current.emit('send_message', {
      roomId: activeRoom.room_id,
      messageText: inputText,
      senderType
    });

    setInputText('');
  };

  // Nếu chưa đăng nhập, không hiển thị widget chat
  if (!user) return null;

  return (
    <div className={`chat-widget-wrapper ${isOpen ? 'active' : ''}`}>
      {/* 1. Nút bong bóng chat nổi (ở góc màn hình) */}
      {!isOpen && (
        <button className="chat-bubble-btn" onClick={() => setIsOpen(true)}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span className="chat-bubble-text">Nhắn tin</span>
          {unreadTotal > 0 && <span className="chat-badge">{unreadTotal}</span>}
        </button>
      )}

      {/* 2. Khung chat chính */}
      {isOpen && (
        <div className="chat-main-card">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>{user.role === 'seller' ? 'Chăm sóc khách hàng' : 'Trò chuyện'}</span>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="chat-body">
            {/* Panel Bên trái: Danh sách phòng chat */}
            <div className="chat-sidebar">
              {rooms.length === 0 ? (
                <div className="chat-empty-rooms">Chưa có cuộc hội thoại nào</div>
              ) : (
                rooms.map((room) => {
                  const partnerName = user.role === 'seller' ? room.buyer_name : room.shop_name;
                  const isSelected = activeRoom?.room_id === room.room_id;
                  
                  return (
                    <div
                      key={room.room_id}
                      className={`chat-room-item ${isSelected ? 'active' : ''} ${room.unread_count > 0 ? 'unread' : ''}`}
                      onClick={() => handleSelectRoom(room)}
                    >
                      <div className="chat-room-avatar">
                        {(partnerName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="chat-room-info">
                        <div className="chat-room-name">{partnerName || 'Khách hàng'}</div>
                        <div className="chat-room-last-msg">
                          {room.last_message || 'Bắt đầu cuộc trò chuyện'}
                        </div>
                      </div>
                      {room.unread_count > 0 && (
                        <div className="chat-room-badge">{room.unread_count}</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Panel Bên phải: Khung nhắn tin chi tiết */}
            <div className="chat-window">
              {activeRoom ? (
                <>
                  {/* Chat Partner Header */}
                  <div className="chat-window-header">
                    <span className="chat-partner-name">
                      {user.role === 'seller' ? activeRoom.buyer_name : activeRoom.shop_name}
                    </span>
                  </div>

                  {/* List of messages */}
                  <div className="chat-messages-area">
                    {messages.length === 0 ? (
                      <div className="chat-messages-start">
                        Gửi lời chào để bắt đầu cuộc trò chuyện!
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isOwn = msg.sender_id === user.id;
                        return (
                          <div
                            key={msg.id}
                            className={`chat-message-row ${isOwn ? 'own' : 'other'}`}
                          >
                            <div className="chat-message-bubble">
                              {msg.message_text}
                            </div>
                            <div className="chat-message-time">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input form */}
                  <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      placeholder="Nhập tin nhắn..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    <button type="submit" disabled={!inputText.trim()}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </form>
                </>
              ) : (
                <div className="chat-window-placeholder">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: '16px' }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Chọn một cuộc hội thoại để bắt đầu trò chuyện</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
