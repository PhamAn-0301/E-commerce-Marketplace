// Xử lý đăng nhập từ form (POST /login)
exports.loginFormHandler = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);
        if (result.error) {
            return res.render('login', { error: result.error });
        }
        // Đăng nhập thành công, chuyển về trang chủ
        return res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Đăng nhập thất bại.' });
    }
};
const userService = require('../services/userService');

// Đăng ký API: POST /auth/register
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

// Đăng nhập API: POST /auth/login
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
