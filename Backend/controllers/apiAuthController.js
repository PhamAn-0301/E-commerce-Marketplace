const userService = require('../services/userService');

// Đăng ký API: POST /register
// Controller nhận dữ liệu từ body, chuyển cho userService xử lý nghiệp vụ đăng ký.
// Nếu service trả lỗi thì response 400, nếu thành công thì response 201.
exports.registerApi = async (req, res) => {
    try {
        const result = await userService.registerUser(req.body);
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }
        return res.status(201).json({ message: result.success });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Đăng ký thất bại.' });
    }
};

// Đăng nhập API: POST /login
// Controller lấy email/password từ body, gọi userService để xác thực.
// Trước khi trả user về frontend, controller xóa password_hash để không lộ mật khẩu đã hash.
exports.loginApi = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }
        const { user, token } = result;
        if (user && user.password_hash) delete user.password_hash;
        return res.json({ message: result.success, token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Đăng nhập thất bại.' });
    }
};
