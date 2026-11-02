/**
 * End-to-End API Integration Test Suite
 * Tests all required REST endpoints, role authorization, and validation rules.
 */
process.env.NODE_ENV = 'test';
process.env.USE_SQLITE = 'true';

const http = require('http');
const app = require('../src/server');

let server;
let baseUrl;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BARANGAY TINURIK PORTAL API TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Start test server on dynamic port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server active on ${baseUrl}\n`);

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'HEALTHY', 'GET /api/health returns HEALTHY');

    // 2. Login Admin
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@tinurik.gov.ph',
      password: 'Admin123!'
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'ADMIN', 'POST /api/auth/login works for Admin');
    const adminToken = adminLogin.body.token;

    // 3. Login Resident
    const residentLogin = await request('POST', '/api/auth/login', {
      email: 'user@tinurik.gov.ph',
      password: 'User123!'
    });
    assert(residentLogin.status === 200 && residentLogin.body.user.role === 'USER', 'POST /api/auth/login works for Resident');
    const residentToken = residentLogin.body.token;

    // 4. Register a new resident
    const uniqueEmail = `testresident_${Date.now()}@tinurik.gov.ph`;
    const regRes = await request('POST', '/api/auth/register', {
      full_name: 'Test Resident Juan',
      email: uniqueEmail,
      password: 'Password123!',
      address: 'Purok 4, Tinurik',
      contact_number: '0912-345-6789'
    });
    assert(regRes.status === 201 && regRes.body.token, 'POST /api/auth/register registers new resident');

    // 5. GET /api/auth/me
    const meRes = await request('GET', '/api/auth/me', null, { Authorization: `Bearer ${residentToken}` });
    assert(meRes.status === 200 && meRes.body.user.email === 'user@tinurik.gov.ph', 'GET /api/auth/me returns current resident profile');

    // 6. Get Document Types
    const docTypesRes = await request('GET', '/api/document-types');
    assert(docTypesRes.status === 200 && Array.isArray(docTypesRes.body.data) && docTypesRes.body.data.length >= 6, 'GET /api/document-types returns predefined types');

    // 7. Resident Submit Document Request
    const submitReqRes = await request('POST', '/api/requests', {
      document_type_id: 1,
      purpose: 'Job application for local cooperative',
      full_name: 'Juan Dela Cruz',
      address: 'Purok 3, Barangay Tinurik',
      contact_number: '0998-765-4321'
    }, { Authorization: `Bearer ${residentToken}` });
    assert(submitReqRes.status === 201 && submitReqRes.body.data.status === 'Pending', 'POST /api/requests creates request in Pending status');
    const newRequestId = submitReqRes.body.data.id;

    // 8. Resident reads own requests
    const residentReqs = await request('GET', '/api/requests', null, { Authorization: `Bearer ${residentToken}` });
    assert(residentReqs.status === 200 && residentReqs.body.data.every(r => r.user_id === residentLogin.body.user.id), 'GET /api/requests for Resident ONLY returns own records');

    // 9. Resident edits pending request
    const updateReqRes = await request('PUT', `/api/requests/${newRequestId}`, {
      purpose: 'Updated Purpose: Overseas employment clearance',
      full_name: 'Juan Dela Cruz',
      address: 'Purok 3, Barangay Tinurik',
      contact_number: '0998-765-4321',
      document_type_id: 1
    }, { Authorization: `Bearer ${residentToken}` });
    assert(updateReqRes.status === 200 && updateReqRes.body.data.purpose.includes('Updated Purpose'), 'PUT /api/requests/:id allows resident to edit pending request');

    // 10. Admin views all requests
    const adminReqs = await request('GET', '/api/requests', null, { Authorization: `Bearer ${adminToken}` });
    assert(adminReqs.status === 200 && adminReqs.body.data.length >= 2, 'GET /api/requests for Admin returns all resident requests');

    // 11. Admin approves request
    const approveRes = await request('PATCH', `/api/requests/${newRequestId}/status`, {
      status: 'Approved',
      remarks: 'Documents verified and cleared by barangay secretary.'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(approveRes.status === 200 && approveRes.body.data.status === 'Approved', 'PATCH /api/requests/:id/status allows Admin to Approve request');

    // 12. Resident cannot edit approved request
    const invalidEditRes = await request('PUT', `/api/requests/${newRequestId}`, {
      purpose: 'Should fail because already approved'
    }, { Authorization: `Bearer ${residentToken}` });
    assert(invalidEditRes.status === 400, 'PUT /api/requests/:id blocks resident from editing non-pending request');

    // 13. Rejection requires a reason
    const invalidReject = await request('PATCH', `/api/requests/${newRequestId}/status`, {
      status: 'Rejected'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(invalidReject.status === 400, 'PATCH /api/requests/:id/status enforces rejection reason when rejecting');

    // 14. Admin Marks request as Completed
    const completeRes = await request('PATCH', `/api/requests/${newRequestId}/status`, {
      status: 'Completed',
      remarks: 'Issued to resident at counter.'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(completeRes.status === 200 && completeRes.body.data.status === 'Completed', 'PATCH /api/requests/:id/status marks request Completed');

    // 15. View Request Tracking and History
    const trackingRes = await request('GET', `/api/requests/${newRequestId}`, null, { Authorization: `Bearer ${residentToken}` });
    assert(trackingRes.status === 200 && trackingRes.body.data.history.length >= 3, 'GET /api/requests/:id returns timeline history log');

    // 16. Admin Dashboard Stats
    const adminStats = await request('GET', '/api/dashboard/stats', null, { Authorization: `Bearer ${adminToken}` });
    assert(adminStats.status === 200 && adminStats.body.data.totalRequests > 0 && adminStats.body.data.totalResidents > 0, 'GET /api/dashboard/stats returns Admin counts');

    // 17. Resident Dashboard Stats
    const residentStats = await request('GET', '/api/dashboard/stats', null, { Authorization: `Bearer ${residentToken}` });
    assert(residentStats.status === 200 && residentStats.body.data.role === 'USER', 'GET /api/dashboard/stats returns Resident specific counts');

    // 18. Admin Manage Document Types (Create, Update, Delete)
    const newDocType = await request('POST', '/api/document-types', {
      document_name: `Certificate of Solo Parent ${Date.now()}`,
      description: 'Official certification for solo parents in Tinurik'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(newDocType.status === 201, 'POST /api/document-types allows Admin to add document type');

    const updateDocType = await request('PUT', `/api/document-types/${newDocType.body.data.id}`, {
      document_name: newDocType.body.data.document_name,
      description: 'Updated description for solo parents',
      is_active: true
    }, { Authorization: `Bearer ${adminToken}` });
    assert(updateDocType.status === 200, 'PUT /api/document-types/:id allows Admin to update document type');

    const deleteDocType = await request('DELETE', `/api/document-types/${newDocType.body.data.id}`, null, { Authorization: `Bearer ${adminToken}` });
    assert(deleteDocType.status === 200, 'DELETE /api/document-types/:id allows Admin to delete document type');

    // 19. Admin Resident Management & Self-Deactivation Guard
    const usersList = await request('GET', '/api/users', null, { Authorization: `Bearer ${adminToken}` });
    assert(usersList.status === 200 && usersList.body.data.length > 0, 'GET /api/users lists registered residents');

    // Try deactivating own admin account (MUST FAIL)
    const selfDeactivate = await request('PATCH', `/api/users/${adminLogin.body.user.id}/status`, {
      is_active: false
    }, { Authorization: `Bearer ${adminToken}` });
    assert(selfDeactivate.status === 400, 'PATCH /api/users/:id/status prevents Admin from deactivating own account');

    console.log(`\n--- TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  } catch (err) {
    console.error('Test runner encountered unexpected error:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
