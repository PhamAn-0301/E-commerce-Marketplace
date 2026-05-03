const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

const apiAuthRoute = require('./routes/apiAuth');
const protectedRoute = require('./routes/protected');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/', apiAuthRoute);
app.use('/api/protected', protectedRoute);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user', userRoutes);

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    // Chỉ start server khi chạy trực tiếp file app.js.
    // Khi test hoặc require app từ file khác, Express app được export mà không tự listen.
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
