
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Thiết lập view engine Handlebars
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Sử dụng routes
const homeRoute = require('./routes/home');
app.use('/', homeRoute);

// Khởi động server nếu chạy trực tiếp
if (require.main === module) {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running at http://localhost:${PORT}`);
	});
}

module.exports = app;
