const express = require('express');
const router = express.Router();
const documentTypeController = require('../controllers/documentTypeController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Optional auth: public users can list active document types; authenticated admins can pass ?all=true
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
};

// GET /api/document-types
router.get('/', optionalAuth, documentTypeController.getDocumentTypes);

// Admin-only management endpoints
router.post('/', authenticateToken, requireAdmin, documentTypeController.createDocumentType);
router.put('/:id', authenticateToken, requireAdmin, documentTypeController.updateDocumentType);
router.delete('/:id', authenticateToken, requireAdmin, documentTypeController.deleteDocumentType);

module.exports = router;
