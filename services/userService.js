const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Validate input
function validateRegisterInput({ full_name, email, password, phone, role }) {
    if (!full_name || !email || !password || !phone || !role) {
        return 'Vui lòng nhập đầy đủ thông tin.';
    }
    // Có thể bổ sung validate nâng cao ở đây
    return null;
}

// Kiểm tra email đã tồn tại
async function isEmailExists(email) {
    const user = await userModel.findByEmail(email);
    return !!user;
}

// Đăng ký user mới
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

/**
 * Đăng nhập user và trả về JWT
 * @param {string} email
 * @param {string} password
 * @returns {object} - { error } hoặc { success, token, user }
 */
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
    // Tạo JWT token
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };
    // Nên lưu secret key ở biến môi trường
    const secret = process.env.JWT_SECRET || 'your_jwt_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    return { success: 'Đăng nhập thành công!', token, user };
}

module.exports = {
    validateRegisterInput,
    isEmailExists,
    registerUser,
    loginUser
};
