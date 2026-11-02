const db = require('../config/db');

/**
 * List document types
 * GET /api/document-types
 * Admins can pass ?all=true to see inactive types as well.
 */
const getDocumentTypes = async (req, res) => {
  try {
    const showAll = req.query.all === 'true' && req.user && req.user.role === 'ADMIN';
    const queryText = showAll
      ? 'SELECT id, document_name, description, is_active, created_at FROM document_types ORDER BY id ASC'
      : 'SELECT id, document_name, description, is_active, created_at FROM document_types WHERE is_active = true ORDER BY id ASC';

    const result = await db.query(queryText);
    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get Document Types Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve document types.'
    });
  }
};

/**
 * Create a new document type (Admin only)
 * POST /api/document-types
 */
const createDocumentType = async (req, res) => {
  try {
    const { document_name, description } = req.body;

    if (!document_name || !document_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Document name is required.'
      });
    }

    // Check duplicate
    const existing = await db.query(
      'SELECT id FROM document_types WHERE LOWER(document_name) = LOWER($1)',
      [document_name.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A document type with this name already exists.'
      });
    }

    const result = await db.query(
      `INSERT INTO document_types (document_name, description, is_active)
       VALUES ($1, $2, true)
       RETURNING id, document_name, description, is_active, created_at`,
      [document_name.trim(), (description || '').trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Document type created successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create Document Type Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create document type.'
    });
  }
};

/**
 * Update document type (Admin only)
 * PUT /api/document-types/:id
 */
const updateDocumentType = async (req, res) => {
  try {
    const { id } = req.params;
    const { document_name, description, is_active } = req.body;

    if (!document_name || !document_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Document name is required.'
      });
    }

    // Check if another type has the same name
    const conflict = await db.query(
      'SELECT id FROM document_types WHERE LOWER(document_name) = LOWER($1) AND id != $2',
      [document_name.trim(), id]
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Another document type with this name already exists.'
      });
    }

    const activeStatus = typeof is_active === 'boolean' ? is_active : true;

    const result = await db.query(
      `UPDATE document_types
       SET document_name = $1, description = $2, is_active = $3
       WHERE id = $4
       RETURNING id, document_name, description, is_active, created_at`,
      [document_name.trim(), (description || '').trim(), activeStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document type not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Document type updated successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update Document Type Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update document type.'
    });
  }
};

/**
 * Delete document type (Admin only)
 * DELETE /api/document-types/:id
 */
const deleteDocumentType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any document requests reference this document type
    const requestCheck = await db.query(
      'SELECT id FROM document_requests WHERE document_type_id = $1 LIMIT 1',
      [id]
    );

    if (requestCheck.rows.length > 0) {
      // If referenced by requests, soft-deactivate instead to preserve integrity
      await db.query(
        'UPDATE document_types SET is_active = false WHERE id = $1',
        [id]
      );

      return res.status(200).json({
        success: true,
        message: 'Document type is referenced by existing resident requests and has been deactivated instead of permanently deleted to preserve audit integrity.'
      });
    }

    const result = await db.query('DELETE FROM document_types WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document type not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Document type deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Document Type Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete document type.'
    });
  }
};

module.exports = {
  getDocumentTypes,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType
};
