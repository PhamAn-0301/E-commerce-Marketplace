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
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/', apiAuthRoute);
app.use('/api/protected', protectedRoute);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/chat', chatRoutes);

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    // Chỉ start server khi chạy trực tiếp file app.js.
    // Khi test hoặc require app từ file khác, Express app được export mà không tự listen.
    const server = app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });

    // Khởi tạo WebSocket (Socket.io)
    const { initSocket } = require('./utils/socketHandler');
    initSocket(server);
}

module.exports = app;
