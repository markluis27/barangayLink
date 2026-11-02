const db = require('../config/db');

/**
 * Get dashboard statistics
 * GET /api/dashboard/stats
 */
const getStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const userId = req.user.id;

    if (isAdmin) {
      // Admin dashboard metrics
      const [
        residentsCount,
        requestsCount,
        pendingCount,
        approvedCount,
        rejectedCount,
        completedCount,
        docTypesCount,
        recentRequests
      ] = await Promise.all([
        db.query("SELECT count(*) as count FROM users WHERE role = 'USER'"),
        db.query('SELECT count(*) as count FROM document_requests'),
        db.query("SELECT count(*) as count FROM document_requests WHERE status = 'Pending'"),
        db.query("SELECT count(*) as count FROM document_requests WHERE status = 'Approved'"),
        db.query("SELECT count(*) as count FROM document_requests WHERE status = 'Rejected'"),
        db.query("SELECT count(*) as count FROM document_requests WHERE status = 'Completed'"),
        db.query('SELECT count(*) as count FROM document_types WHERE is_active = true'),
        db.query(`
          SELECT 
            r.id, r.full_name, r.purpose, r.status, r.created_at, dt.document_name
          FROM document_requests r
          JOIN document_types dt ON r.document_type_id = dt.id
          ORDER BY r.id DESC
          LIMIT 5
        `)
      ]);

      return res.status(200).json({
        success: true,
        data: {
          role: 'ADMIN',
          totalResidents: parseInt(residentsCount.rows[0].count, 10),
          totalRequests: parseInt(requestsCount.rows[0].count, 10),
          pendingRequests: parseInt(pendingCount.rows[0].count, 10),
          approvedRequests: parseInt(approvedCount.rows[0].count, 10),
          rejectedRequests: parseInt(rejectedCount.rows[0].count, 10),
          completedRequests: parseInt(completedCount.rows[0].count, 10),
          activeDocumentTypes: parseInt(docTypesCount.rows[0].count, 10),
          recentRequests: recentRequests.rows
        }
      });
    } else {
      // Resident dashboard metrics
      const [
        myRequestsCount,
        myPendingCount,
        myApprovedCount,
        myRejectedCount,
        myCompletedCount,
        myRecentRequests
      ] = await Promise.all([
        db.query('SELECT count(*) as count FROM document_requests WHERE user_id = $1', [userId]),
        db.query("SELECT count(*) as count FROM document_requests WHERE user_id = $1 AND status = 'Pending'", [userId]),
        db.query("SELECT count(*) as count FROM document_requests WHERE user_id = $1 AND status = 'Approved'", [userId]),
        db.query("SELECT count(*) as count FROM document_requests WHERE user_id = $1 AND status = 'Rejected'", [userId]),
        db.query("SELECT count(*) as count FROM document_requests WHERE user_id = $1 AND status = 'Completed'", [userId]),
        db.query(`
          SELECT 
            r.id, r.full_name, r.purpose, r.status, r.rejection_reason, r.created_at, dt.document_name
          FROM document_requests r
          JOIN document_types dt ON r.document_type_id = dt.id
          WHERE r.user_id = $1
          ORDER BY r.id DESC
          LIMIT 5
        `, [userId])
      ]);

      return res.status(200).json({
        success: true,
        data: {
          role: 'USER',
          totalRequests: parseInt(myRequestsCount.rows[0].count, 10),
          pendingRequests: parseInt(myPendingCount.rows[0].count, 10),
          approvedRequests: parseInt(myApprovedCount.rows[0].count, 10),
          rejectedRequests: parseInt(myRejectedCount.rows[0].count, 10),
          completedRequests: parseInt(myCompletedCount.rows[0].count, 10),
          recentRequests: myRecentRequests.rows
        }
      });
    }
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics.'
    });
  }
};

module.exports = {
  getStats
};
