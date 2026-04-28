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

module.exports = {
    registerUser,
    loginUser
};
