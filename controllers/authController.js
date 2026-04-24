
const userService = require('../services/userService');

// Hiển thị form đăng ký
exports.showRegisterForm = (req, res) => {
    res.render('register');
};

// Xử lý đăng ký
exports.registerUser = async (req, res) => {
    try {
        const result = await userService.registerUser(req.body);
        if (result.error) {
            return res.render('register', { error: result.error });
        }
        return res.render('register', { success: result.success });
    } catch (err) {
        console.error(err);
        res.render('register', { error: 'Có lỗi xảy ra, vui lòng thử lại.' });
    }
};
