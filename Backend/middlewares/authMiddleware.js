const jwt = require('jsonwebtoken');

// Middleware bảo vệ route yêu cầu đăng nhập.
// Hàm đọc header Authorization dạng "Bearer <token>", verify JWT,
// rồi gắn payload user vào req.user để các handler phía sau sử dụng.
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'your_jwt_secret';
        // jwt.verify kiểm tra chữ ký và hạn dùng token; callback nhận payload user nếu hợp lệ.
        jwt.verify(token, secret, (err, user) => {
            if (err) return res.status(403).json({ error: 'Token không hợp lệ' });
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: 'Không có token' });
    }
}

module.exports = { authenticateJWT };
