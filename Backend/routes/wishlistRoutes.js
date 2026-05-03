const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

router.use(authenticateJWT);

router.get('/', wishlistController.getWishlist);
router.get('/check/:productId/:variantId', wishlistController.checkWishlist);
router.post('/toggle', wishlistController.toggleWishlist);
router.delete('/remove/:itemId', wishlistController.removeWishlistItem);

module.exports = router;
