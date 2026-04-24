const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

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

module.exports = {
    validateRegisterInput,
    isEmailExists,
    registerUser
};
