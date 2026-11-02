const db = require('../config/db');

/**
 * Get all users (Admin only)
 * GET /api/users
 */
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let queryParams = [];
    let sql = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.address,
        u.contact_number,
        u.role,
        u.is_active,
        u.created_at,
        COUNT(r.id) AS total_requests
      FROM users u
      LEFT JOIN document_requests r ON u.id = r.user_id
      WHERE 1=1
    `;

    if (role) {
      queryParams.push(role);
      sql += ` AND u.role = $${queryParams.length}`;
    }

    if (search && search.trim()) {
      queryParams.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(u.full_name) LIKE $${queryParams.length} OR LOWER(u.email) LIKE $${queryParams.length} OR LOWER(u.contact_number) LIKE $${queryParams.length})`;
    }

    sql += ' GROUP BY u.id ORDER BY u.id ASC';

    const result = await db.query(sql, queryParams);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.'
    });
  }
};

/**
 * Get single user by ID (Admin or current user)
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'ADMIN' && parseInt(id, 10) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You cannot view another user profile.'
      });
    }

    const result = await db.query(
      `SELECT id, full_name, email, address, contact_number, role, is_active, created_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get User By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user.'
    });
  }
};

/**
 * Update user details
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, address, contact_number, email } = req.body;

    if (req.user.role !== 'ADMIN' && parseInt(id, 10) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only update your own profile.'
      });
    }

    // Verify user exists
    const existingResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const current = existingResult.rows[0];

    const updatedFullName = full_name ? full_name.trim() : current.full_name;
    const updatedAddress = address ? address.trim() : current.address;
    const updatedContact = contact_number ? contact_number.trim() : current.contact_number;
    const updatedEmail = (email && req.user.role === 'ADMIN') ? email.trim().toLowerCase() : current.email;

    const result = await db.query(
      `UPDATE users
       SET full_name = $1, address = $2, contact_number = $3, email = $4
       WHERE id = $5
       RETURNING id, full_name, email, address, contact_number, role, is_active, created_at`,
      [updatedFullName, updatedAddress, updatedContact, updatedEmail, id]
    );

    return res.status(200).json({
      success: true,
      message: 'User details updated successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update User Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user.'
    });
  }
};

/**
 * Update user active status (deactivate / activate) (Admin only)
 * PATCH /api/users/:id/status
 * Crucial: Prevent admins from deactivating or deleting their own account
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const targetUserId = parseInt(id, 10);

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_active field must be a boolean (true or false).'
      });
    }

    // Safeguard: Never allow an admin to deactivate their own account
    if (targetUserId === req.user.id && !is_active) {
      return res.status(400).json({
        success: false,
        message: 'Action blocked: You cannot deactivate your own administrative account.'
      });
    }

    // Check user exists
    const existing = await db.query('SELECT id, role, full_name FROM users WHERE id = $1', [targetUserId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const result = await db.query(
      `UPDATE users
       SET is_active = $1
       WHERE id = $2
       RETURNING id, full_name, email, role, is_active`,
      [is_active, targetUserId]
    );

    return res.status(200).json({
      success: true,
      message: `Account for ${result.rows[0].full_name} has been ${is_active ? 'activated' : 'deactivated'}.`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update User Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status.'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus
};
