const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Kiểm tra dữ liệu đăng ký bắt buộc.
// Nếu thiếu field thì trả về chuỗi lỗi, nếu hợp lệ thì trả null.
function validateRegisterInput({ full_name, email, password, phone, role }) {
    if (!full_name || !email || !password || !phone || !role) {
        return 'Vui lòng nhập đầy đủ thông tin.';
    }
    return null;
}

// Kiểm tra email đã tồn tại trong hệ thống chưa.
// Hàm trả boolean để registerUser xử lý rõ ràng hơn.
async function isEmailExists(email) {
    const user = await userModel.findByEmail(email);
    return !!user;
}

// Xử lý nghiệp vụ đăng ký user.
// Luồng chính: validate input -> kiểm tra trùng email -> hash mật khẩu -> tạo user.
// Hàm trả object { error } hoặc { success } để controller quyết định status code.
async function registerUser({ full_name, email, password, phone, role }) {
    const error = validateRegisterInput({ full_name, email, password, phone, role });
    if (error) return { error };
    if (await isEmailExists(email)) {
        return { error: 'Email đã tồn tại.' };
    }
    const password_hash = await bcrypt.hash(password, 10);
    await userModel.createUser({ full_name, email, password_hash, phone, role });
    return { success: 'Đăng ký thành công!' };
}

// Xử lý nghiệp vụ đăng nhập.
// Luồng chính: kiểm tra input -> tìm user -> so sánh mật khẩu hash -> tạo JWT.
// Khi thành công trả token và user để controller gửi về frontend.
async function loginUser(email, password) {
    if (!email || !password) {
        return { error: 'Vui lòng nhập đầy đủ email và mật khẩu.' };
    }
    const user = await userModel.findByEmail(email);
    if (!user) {
        return { error: 'Email hoặc mật khẩu không đúng.' };
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        return { error: 'Email hoặc mật khẩu không đúng.' };
    }
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };
    const secret = process.env.JWT_SECRET || 'your_jwt_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    return { success: 'Đăng nhập thành công!', token, user };
}

// Cập nhật thông tin cá nhân (full_name, phone).
// Service validate input rồi gọi model update.
async function updateProfile(userId, { full_name, phone }) {
    if (!full_name || !phone) {
        return { error: 'Vui lòng nhập đầy đủ họ tên và số điện thoại.' };
    }
    const updatedUser = await userModel.updateProfile(userId, { full_name, phone });
    if (!updatedUser) {
        return { error: 'Không tìm thấy user.' };
    }
    return { success: 'Cập nhật thông tin thành công!', user: updatedUser };
}

// Đổi mật khẩu: verify mật khẩu cũ → hash mới → update.
async function changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
        return { error: 'Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới.' };
    }
    if (newPassword.length < 6) {
        return { error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
    }
    const user = await userModel.findById(userId);
    if (!user) {
        return { error: 'Không tìm thấy user.' };
    }
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
        return { error: 'Mật khẩu cũ không đúng.' };
    }
    const password_hash = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(userId, password_hash);
    return { success: 'Đổi mật khẩu thành công!' };
}

// Cập nhật thông tin shop (chỉ seller).
// Verify user là chủ shop trước khi cho update.
const shopModel = require('../models/shopModel');

async function updateShopInfo(userId, { shop_name, description }) {
    if (!shop_name) {
        return { error: 'Vui lòng nhập tên shop.' };
    }
    const shop = await shopModel.findByUserId(userId);
    if (!shop) {
        return { error: 'Không tìm thấy shop của bạn.' };
    }
    const updatedShop = await shopModel.updateShopInfo(shop.id, { shop_name, description: description || '' });
    return { success: 'Cập nhật thông tin shop thành công!', shop: updatedShop };
}

// Lấy thông tin profile (user + shop nếu là seller).
async function getProfile(userId) {
    const user = await userModel.findById(userId);
    if (!user) return { error: 'Không tìm thấy user.' };

    const profile = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
    };

    if (user.role === 'seller') {
        const shop = await shopModel.findByUserId(userId);
        profile.shop = shop || null;
    }

    return { profile };
}

module.exports = {
    registerUser,
    loginUser,
    updateProfile,
    changePassword,
    updateShopInfo,
    getProfile
};
