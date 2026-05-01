const bcrypt = require('bcrypt');

// Lấy password từ đối số dòng lệnh, nếu không có thì dùng mặc định '123456'
const password = process.argv[2] || '123456';
const saltRounds = 10;

console.log("Đang hash password, vui lòng đợi...");

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error("Lỗi khi hash password:", err);
        return;
    }
    console.log("----------------------------------------");
    console.log("Mật khẩu ban đầu   :", password);
    console.log("Mật khẩu sau khi hash:", hash);
    console.log("----------------------------------------");
});
