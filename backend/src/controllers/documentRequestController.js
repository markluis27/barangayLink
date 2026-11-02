const db = require('../config/db');

/**
 * Submit a new document request
 * POST /api/requests
 */
const createRequest = async (req, res) => {
  try {
    const { document_type_id, purpose, full_name, address, contact_number } = req.body;
    const userId = req.user.id;

    // Validation
    if (!document_type_id || !purpose || !full_name || !address || !contact_number) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: Document Type, Purpose, Full Name, Address, and Contact Number.'
      });
    }

    // Verify document type exists and is active
    const docTypeResult = await db.query(
      'SELECT id, document_name, is_active FROM document_types WHERE id = $1',
      [document_type_id]
    );

    if (docTypeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Selected document type does not exist.'
      });
    }

    if (!docTypeResult.rows[0].is_active) {
      return res.status(400).json({
        success: false,
        message: 'Selected document type is currently not available for requests.'
      });
    }

    // Insert document request
    const insertResult = await db.query(
      `INSERT INTO document_requests (user_id, document_type_id, full_name, address, contact_number, purpose, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, user_id, document_type_id, full_name, address, contact_number, purpose, status, rejection_reason, created_at, updated_at`,
      [userId, document_type_id, full_name.trim(), address.trim(), contact_number.trim(), purpose.trim()]
    );

    const newRequest = insertResult.rows[0];

    // Record initial status history
    await db.query(
      `INSERT INTO request_status_history (request_id, previous_status, new_status, remarks, updated_by, created_at)
       VALUES ($1, NULL, 'Pending', $2, $3, CURRENT_TIMESTAMP)`,
      [newRequest.id, `Request submitted by resident ${full_name.trim()}`, userId]
    );

    return res.status(201).json({
      success: true,
      message: 'Document request submitted successfully! Your tracking ID is #' + newRequest.id,
      data: {
        ...newRequest,
        document_name: docTypeResult.rows[0].document_name
      }
    });
  } catch (error) {
    console.error('Create Request Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit document request.'
    });
  }
};

/**
 * Get document requests
 * GET /api/requests
 * - Admin gets all requests (supports query filters)
 * - Resident gets ONLY their own requests
 */
const getRequests = async (req, res) => {
  try {
    const { status, search } = req.query;
    let queryParams = [];
    let sql = `
      SELECT 
        r.id,
        r.user_id,
        r.document_type_id,
        dt.document_name,
        r.full_name,
        r.address,
        r.contact_number,
        r.purpose,
        r.status,
        r.rejection_reason,
        r.created_at,
        r.updated_at,
        u.email as resident_email
      FROM document_requests r
      JOIN document_types dt ON r.document_type_id = dt.id
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;

    // Role-based access control
    if (req.user.role !== 'ADMIN') {
      queryParams.push(req.user.id);
      sql += ` AND r.user_id = $${queryParams.length}`;
    }

    // Filter by status if provided
    if (status && ['Pending', 'Approved', 'Rejected', 'Completed'].includes(status)) {
      queryParams.push(status);
      sql += ` AND r.status = $${queryParams.length}`;
    }

    // Search filter
    if (search && search.trim()) {
      queryParams.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(r.full_name) LIKE $${queryParams.length} OR LOWER(r.purpose) LIKE $${queryParams.length} OR LOWER(dt.document_name) LIKE $${queryParams.length})`;
    }

    sql += ' ORDER BY r.id DESC';

    const result = await db.query(sql, queryParams);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get Requests Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve document requests.'
    });
  }
};

/**
 * Get single request details by ID with history
 * GET /api/requests/:id
 */
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const requestResult = await db.query(
      `SELECT 
        r.id,
        r.user_id,
        r.document_type_id,
        dt.document_name,
        r.full_name,
        r.address,
        r.contact_number,
        r.purpose,
        r.status,
        r.rejection_reason,
        r.created_at,
        r.updated_at,
        u.email as resident_email
      FROM document_requests r
      JOIN document_types dt ON r.document_type_id = dt.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1`,
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document request not found.'
      });
    }

    const request = requestResult.rows[0];

    // Authorization: User can only see their own request
    if (req.user.role !== 'ADMIN' && request.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view this request.'
      });
    }

    // Fetch history
    const historyResult = await db.query(
      `SELECT 
        h.id,
        h.request_id,
        h.previous_status,
        h.new_status,
        h.remarks,
        h.updated_by,
        u.full_name as updated_by_name,
        h.created_at
      FROM request_status_history h
      LEFT JOIN users u ON h.updated_by = u.id
      WHERE h.request_id = $1
      ORDER BY h.created_at ASC, h.id ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...request,
        history: historyResult.rows
      }
    });
  } catch (error) {
    console.error('Get Request By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve request details.'
    });
  }
};

/**
 * Update request details
 * PUT /api/requests/:id
 * - Resident can edit only if status is Pending
 * - Admin can edit request details
 */
const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { document_type_id, purpose, full_name, address, contact_number } = req.body;

    // Fetch current request
    const existingResult = await db.query('SELECT * FROM document_requests WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document request not found.'
      });
    }

    const request = existingResult.rows[0];

    // Access check
    if (req.user.role !== 'ADMIN') {
      if (request.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. You can only update your own requests.'
        });
      }

      if (request.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: `Cannot edit request. Only 'Pending' requests can be edited (current status: ${request.status}).`
        });
      }
    }

    // Verify document type if changed
    const targetDocTypeId = document_type_id || request.document_type_id;
    const docCheck = await db.query('SELECT id FROM document_types WHERE id = $1', [targetDocTypeId]);
    if (docCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Specified document type does not exist.'
      });
    }

    const updatedFullName = full_name ? full_name.trim() : request.full_name;
    const updatedAddress = address ? address.trim() : request.address;
    const updatedContact = contact_number ? contact_number.trim() : request.contact_number;
    const updatedPurpose = purpose ? purpose.trim() : request.purpose;

    const result = await db.query(
      `UPDATE document_requests
       SET document_type_id = $1, full_name = $2, address = $3, contact_number = $4, purpose = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, user_id, document_type_id, full_name, address, contact_number, purpose, status, rejection_reason, created_at, updated_at`,
      [targetDocTypeId, updatedFullName, updatedAddress, updatedContact, updatedPurpose, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Document request updated successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update Request Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update document request.'
    });
  }
};

/**
 * Update request status (Admin only)
 * PATCH /api/requests/:id/status
 */
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason, remarks } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Rejection reason is mandatory when rejecting
    if (status === 'Rejected' && (!rejection_reason || !rejection_reason.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required when rejecting a document request.'
      });
    }

    // Fetch existing request
    const existing = await db.query('SELECT id, status, user_id FROM document_requests WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document request not found.'
      });
    }

    const currentStatus = existing.rows[0].status;
    const reasonValue = status === 'Rejected' ? rejection_reason.trim() : null;

    // Update request status
    const updateResult = await db.query(
      `UPDATE document_requests
       SET status = $1, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, user_id, document_type_id, full_name, status, rejection_reason, updated_at`,
      [status, reasonValue, id]
    );

    // Record in history table
    const historyRemark = remarks
      ? remarks.trim()
      : status === 'Rejected'
      ? `Rejected by admin. Reason: ${reasonValue}`
      : `Status changed from ${currentStatus} to ${status} by admin.`;

    await db.query(
      `INSERT INTO request_status_history (request_id, previous_status, new_status, remarks, updated_by, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [id, currentStatus, status, historyRemark, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: `Document request #${id} status successfully updated to ${status}.`,
      data: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Update Request Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update request status.'
    });
  }
};

/**
 * Delete / Cancel document request
 * DELETE /api/requests/:id
 * - Resident: can only delete their own Pending requests
 * - Admin: can delete invalid or duplicate requests
 */
const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT id, user_id, status FROM document_requests WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document request not found.'
      });
    }

    const request = existing.rows[0];

    // Role check
    if (req.user.role !== 'ADMIN') {
      if (request.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. You do not have permission to delete this request.'
        });
      }

      if (request.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel request. Only 'Pending' requests can be cancelled (current status: ${request.status}).`
        });
      }
    }

    // Delete request (cascade will delete history)
    await db.query('DELETE FROM document_requests WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: req.user.role === 'ADMIN'
        ? `Document request #${id} deleted successfully.`
        : `Your request #${id} has been cancelled and deleted.`
    });
  } catch (error) {
    console.error('Delete Request Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete document request.'
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  updateRequestStatus,
  deleteRequest
};
