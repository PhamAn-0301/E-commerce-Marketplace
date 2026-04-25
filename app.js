// API Auth (RESTful)
const apiAuthRoute = require('./routes/apiAuth');
app.use('/', apiAuthRoute);

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Thiết lập view engine Handlebars
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// Middleware để parse form data
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Sử dụng routes
const homeRoute = require('./routes/home');
app.use('/', homeRoute);
// Route cho đăng ký
const authRoute = require('./routes/auth');
app.use('/', authRoute);

// Route mẫu cần xác thực JWT
const protectedRoute = require('./routes/protected');
app.use('/', protectedRoute);

// Khởi động server nếu chạy trực tiếp
if (require.main === module) {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running at http://localhost:${PORT}`);
	});
}

module.exports = app;
