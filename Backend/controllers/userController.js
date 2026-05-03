const userService = require('../services/userService');

const UserController = {
    // GET /api/user/profile
    // Lấy thông tin profile user hiện tại (+ shop nếu là seller).
    async getProfile(req, res) {
        try {
            const result = await userService.getProfile(req.user.id);
            if (result.error) {
                return res.status(404).json({ error: result.error });
            }
            res.json({ message: 'Lấy thông tin profile thành công', profile: result.profile });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Lỗi lấy thông tin profile' });
        }
    },

    // PUT /api/user/profile
    // Cập nhật full_name và phone.
    async updateProfile(req, res) {
        try {
            const { full_name, phone } = req.body;
            const result = await userService.updateProfile(req.user.id, { full_name, phone });
            if (result.error) {
                return res.status(400).json({ error: result.error });
            }
            res.json({ message: result.success, user: result.user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Lỗi cập nhật thông tin' });
        }
    },

    // PUT /api/user/password
    // Đổi mật khẩu (cần nhập mật khẩu cũ để xác minh).
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const result = await userService.changePassword(req.user.id, { currentPassword, newPassword });
            if (result.error) {
                return res.status(400).json({ error: result.error });
            }
            res.json({ message: result.success });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Lỗi đổi mật khẩu' });
        }
    },

    // PUT /api/user/shop
    // Cập nhật thông tin shop (chỉ seller mới gọi được).
    async updateShop(req, res) {
        try {
            const { shop_name, description } = req.body;
            const result = await userService.updateShopInfo(req.user.id, { shop_name, description });
            if (result.error) {
                return res.status(400).json({ error: result.error });
            }
            res.json({ message: result.success, shop: result.shop });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Lỗi cập nhật thông tin shop' });
        }
    },
};

module.exports = UserController;
