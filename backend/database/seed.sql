-- Barangay Tinurik Portal Seed Data
-- Demo Accounts:
-- Admin: admin@tinurik.gov.ph / Admin123!
-- Resident: user@tinurik.gov.ph / User123!

-- 1. Insert Initial Demo Users (passwords hashed with bcrypt cost 10)
INSERT INTO users (full_name, email, password_hash, address, contact_number, role, is_active)
VALUES 
(
    'Barangay Administrator',
    'admin@tinurik.gov.ph',
    '$2b$10$8ZlCwe7o0d..l7eaINrDxeJRhSjnCVAohjjiGDO2thS1Pw0wS5t2y',
    'Barangay Tinurik Hall, Tanauan City, Batangas',
    '0917-123-4567',
    'ADMIN',
    TRUE
),
(
    'Juan Dela Cruz',
    'user@tinurik.gov.ph',
    '$2b$10$ROH1MiNqt6rtruP10fQgJu7cOmg0ZcgFvMw34Jvk6gyQHrGLXAl56',
    'Purok 3, Barangay Tinurik, Tanauan City, Batangas',
    '0998-765-4321',
    'USER',
    TRUE
),
(
    'Maria Santos',
    'maria.santos@tinurik.gov.ph',
    '$2b$10$ROH1MiNqt6rtruP10fQgJu7cOmg0ZcgFvMw34Jvk6gyQHrGLXAl56',
    'Purok 1, Barangay Tinurik, Tanauan City, Batangas',
    '0918-555-0199',
    'USER',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Predefined Document Types
INSERT INTO document_types (document_name, description, is_active)
VALUES 
(
    'Barangay Clearance',
    'Official document certifying that the resident is of good moral standing with no derogatory record in the barangay. Commonly required for employment and legal transactions.',
    TRUE
),
(
    'Certificate of Residency',
    'Proof that the applicant is a bonafide resident residing at a verified address within Barangay Tinurik, Tanauan City.',
    TRUE
),
(
    'Certificate of Indigency',
    'Official certification issued to low-income residents qualifying them for medical, educational, burial, or legal financial assistance.',
    TRUE
),
(
    'Business Clearance',
    'Mandatory barangay clearance for operating, renewing, or establishing a commercial business or trade within Barangay Tinurik jurisdiction.',
    TRUE
),
(
    'Barangay ID',
    'Official barangay government issued identification card verifying identity and residency within Barangay Tinurik.',
    TRUE
),
(
    'Other Documents',
    'Other barangay certifications, endorsements, agreements, or certifications upon request and evaluation.',
    TRUE
)
ON CONFLICT (document_name) DO NOTHING;

-- 3. Insert Initial Document Requests for demo testing
INSERT INTO document_requests (user_id, document_type_id, full_name, address, contact_number, purpose, status, rejection_reason, created_at, updated_at)
VALUES
(
    2,
    1,
    'Juan Dela Cruz',
    'Purok 3, Barangay Tinurik, Tanauan City, Batangas',
    '0998-765-4321',
    'Pre-employment requirement for local electronics manufacturing company.',
    'Pending',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
    2,
    2,
    'Juan Dela Cruz',
    'Purok 3, Barangay Tinurik, Tanauan City, Batangas',
    '0998-765-4321',
    'Bank account opening requirement at Land Bank Tanauan.',
    'Approved',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '4 days'
),
(
    3,
    3,
    'Maria Santos',
    'Purok 1, Barangay Tinurik, Tanauan City, Batangas',
    '0918-555-0199',
    'Financial and medical assistance application at DSWD Tanauan.',
    'Completed',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    CURRENT_TIMESTAMP - INTERVAL '6 days'
);

-- 4. Insert Initial Request Status History
INSERT INTO request_status_history (request_id, previous_status, new_status, remarks, updated_by)
VALUES
(
    1,
    NULL,
    'Pending',
    'Document request submitted by resident Juan Dela Cruz.',
    2
),
(
    2,
    NULL,
    'Pending',
    'Document request submitted by resident Juan Dela Cruz.',
    2
),
(
    2,
    'Pending',
    'Approved',
    'Requirements verified and approved by admin. Ready for processing.',
    1
),
(
    3,
    NULL,
    'Pending',
    'Document request submitted by resident Maria Santos.',
    3
),
(
    3,
    'Pending',
    'Approved',
    'Indigency assessment verified and approved by admin.',
    1
),
(
    3,
    'Approved',
    'Completed',
    'Document printed, stamped, and issued to resident at barangay hall counter.',
    1
);
