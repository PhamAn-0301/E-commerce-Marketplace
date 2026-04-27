const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/authMiddleware');

router.get('/', authenticateJWT, (req, res) => {
    res.json({ message: 'Bạn đã truy cập thành công route bảo vệ!', user: req.user });
});

module.exports = router;
