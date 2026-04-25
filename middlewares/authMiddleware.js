const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực JWT cho các route cần bảo vệ
 * Nếu hợp lệ, req.user sẽ chứa thông tin user từ token
 */
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'your_jwt_secret';
        jwt.verify(token, secret, (err, user) => {
            if (err) return res.status(403).json({ error: 'Token không hợp lệ' });
            req.user = user; // user chứa payload đã giải mã
            next();
        });
    } else {
        res.status(401).json({ error: 'Không có token' });
    }
}

module.exports = { authenticateJWT };
