const express = require('express');
const router = express.Router();
const documentRequestController = require('../controllers/documentRequestController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All request endpoints require authentication
router.use(authenticateToken);

// Create request (Resident)
router.post('/', documentRequestController.createRequest);

// List requests (Resident gets own, Admin gets all)
router.get('/', documentRequestController.getRequests);

// Get single request by ID
router.get('/:id', documentRequestController.getRequestById);

// Update request details (Resident if pending, Admin)
router.put('/:id', documentRequestController.updateRequest);

// Update request status (Admin only)
router.patch('/:id/status', requireAdmin, documentRequestController.updateRequestStatus);

// Cancel/delete request (Resident if pending, Admin)
router.delete('/:id', documentRequestController.deleteRequest);

module.exports = router;
