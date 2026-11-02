const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);

// Admin-only list of users
router.get('/', requireAdmin, userController.getUsers);

// Get user profile by ID
router.get('/:id', userController.getUserById);

// Update user details
router.put('/:id', userController.updateUser);

// Deactivate/activate user (Admin only)
router.patch('/:id/status', requireAdmin, userController.updateUserStatus);

module.exports = router;
