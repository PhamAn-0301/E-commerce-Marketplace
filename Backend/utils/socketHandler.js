const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const chatService = require('../services/chatService');

function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173', // URL của React Frontend
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Middleware xác thực JWT cho tất cả kết nối Socket.io
    io.use((socket, next) => {
        // Token có thể được gửi qua socket.handshake.auth.token hoặc header Authorization
        let token = socket.handshake.auth.token;
        
        if (!token && socket.handshake.headers.authorization) {
            const authHeader = socket.handshake.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            return next(new Error('Yêu cầu đăng nhập (Token missing)'));
        }

        const secret = process.env.JWT_SECRET || 'your_jwt_secret';
        jwt.verify(token, secret, (err, decodedUser) => {
            if (err) {
                return next(new Error('Token không hợp lệ hoặc đã hết hạn'));
            }
            // Lưu thông tin người dùng giải mã được vào socket.user
            socket.user = decodedUser;
            next();
        });
    });

    // Lắng nghe kết nối từ Client
    io.on('connection', (socket) => {
        console.log(`[Socket] User kết nối thành công: ID ${socket.user.id}, Role: ${socket.user.role}`);

        // 1. Khi Client tham gia vào một phòng chat cụ thể
        socket.on('join_room', (roomId) => {
            const roomName = `room_${roomId}`;
            socket.join(roomName);
            console.log(`[Socket] User ${socket.user.id} đã vào phòng: ${roomName}`);
        });

        // 2. Khi Client rời khỏi một phòng chat
        socket.on('leave_room', (roomId) => {
            const roomName = `room_${roomId}`;
            socket.leave(roomName);
            console.log(`[Socket] User ${socket.user.id} đã rời phòng: ${roomName}`);
        });

        // 3. Khi Client gửi tin nhắn trong phòng chat
        socket.on('send_message', async (data) => {
            const { roomId, messageText, senderType } = data;

            if (!roomId || !messageText || !senderType) {
                return socket.emit('error_message', 'Thiếu dữ liệu gửi tin nhắn.');
            }

            // Lưu tin nhắn vào cơ sở dữ liệu qua Service
            const result = await chatService.saveMessage({
                roomId: Number(roomId),
                senderId: socket.user.id,
                senderType,
                messageText
            });

            if (result.error) {
                console.error(`[Socket] Lỗi lưu tin nhắn: ${result.error}`);
                return socket.emit('error_message', result.error);
            }

            // Gửi tin nhắn mới này tới tất cả Client đang ở trong phòng đó (bao gồm cả người gửi và người nhận)
            const roomName = `room_${roomId}`;
            io.to(roomName).emit('receive_message', result.message);
            console.log(`[Socket] Đã gửi tin nhắn trong ${roomName} từ User ${socket.user.id}`);
        });

        // 4. Khi Client ngắt kết nối
        socket.on('disconnect', () => {
            console.log(`[Socket] User ngắt kết nối: ID ${socket.user.id}`);
        });
    });

    return io;
}

module.exports = { initSocket };
