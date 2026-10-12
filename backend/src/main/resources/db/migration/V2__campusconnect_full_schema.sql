-- ====================================================================
-- CampusConnect Core & Extended Modules Schema (V2)
-- ====================================================================

-- 1. Subjects & College Academic Definitions
CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(64) NOT NULL,
  code VARCHAR(32) NOT NULL,
  name VARCHAR(128) NOT NULL,
  credits INT NOT NULL,
  faculty_name VARCHAR(128) NOT NULL,
  syllabus_coverage_percent INT NOT NULL DEFAULT 75,
  PRIMARY KEY (id)
);

-- 2. Official Attendance Records (Read-only for student)
CREATE TABLE IF NOT EXISTS attendance_records (
  id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  attendance_date VARCHAR(16) NOT NULL,
  status VARCHAR(16) NOT NULL,
  source VARCHAR(32) NOT NULL DEFAULT 'college',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- 3. Marks & Internal Assessments (Read-only for student)
CREATE TABLE IF NOT EXISTS mark_records (
  id BIGINT NOT NULL AUTO_INCREMENT,
  student_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  internal1 DOUBLE NOT NULL,
  internal2 DOUBLE NOT NULL,
  assignment DOUBLE NOT NULL,
  total_internal DOUBLE NOT NULL,
  max_internal INT NOT NULL DEFAULT 50,
  credits INT NOT NULL,
  source VARCHAR(32) NOT NULL DEFAULT 'college',
  PRIMARY KEY (id)
);

-- 4. Timetable Entries
CREATE TABLE IF NOT EXISTS timetable_entries (
  id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  day_of_week VARCHAR(16) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  subject_code VARCHAR(32) NOT NULL,
  subject_name VARCHAR(128) NOT NULL,
  start_time VARCHAR(16) NOT NULL,
  end_time VARCHAR(16) NOT NULL,
  room VARCHAR(64) NOT NULL,
  PRIMARY KEY (id)
);

-- 5. Timetable Slots & Class Changes
CREATE TABLE IF NOT EXISTS timetable_slots (
  id VARCHAR(64) NOT NULL,
  day_of_week VARCHAR(16) NOT NULL,
  period INT NOT NULL,
  start_time VARCHAR(16) NOT NULL,
  end_time VARCHAR(16) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  subject_code VARCHAR(32) NOT NULL,
  subject_name VARCHAR(128) NOT NULL,
  room VARCHAR(64) NOT NULL,
  faculty_id VARCHAR(64),
  faculty_name VARCHAR(128),
  slot_type VARCHAR(32) NOT NULL DEFAULT 'lecture',
  color_key VARCHAR(32),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS class_changes (
  id VARCHAR(64) NOT NULL,
  slot_id VARCHAR(64) NOT NULL,
  change_date VARCHAR(16) NOT NULL,
  change_type VARCHAR(32) NOT NULL,
  new_room VARCHAR(64),
  new_time VARCHAR(32),
  note TEXT,
  PRIMARY KEY (id)
);

-- 6. Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  subject_code VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  due_date VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  description TEXT,
  PRIMARY KEY (id)
);

-- 7. Exams
CREATE TABLE IF NOT EXISTS exams (
  id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  subject_code VARCHAR(32) NOT NULL,
  subject_name VARCHAR(128) NOT NULL,
  exam_date VARCHAR(16) NOT NULL,
  start_time VARCHAR(32) NOT NULL,
  duration VARCHAR(32) NOT NULL,
  room VARCHAR(64) NOT NULL,
  PRIMARY KEY (id)
);

-- 8. Circulars
CREATE TABLE IF NOT EXISTS circulars (
  id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(128) NOT NULL,
  semester INT,
  category VARCHAR(64) NOT NULL,
  circular_date VARCHAR(16) NOT NULL,
  content TEXT NOT NULL,
  tags VARCHAR(255),
  PRIMARY KEY (id)
);

-- 9. Syllabus Units & Student Progress
CREATE TABLE IF NOT EXISTS syllabus_units (
  id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  unit_no INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  est_hours INT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS student_unit_progress (
  id BIGINT NOT NULL AUTO_INCREMENT,
  student_id VARCHAR(64) NOT NULL,
  unit_id VARCHAR(64) NOT NULL,
  covered TINYINT(1) NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (student_id, unit_id)
);

-- 10. Past Semesters & Subjects
CREATE TABLE IF NOT EXISTS past_semesters (
  id BIGINT NOT NULL AUTO_INCREMENT,
  student_id VARCHAR(64) NOT NULL,
  semester INT NOT NULL,
  term VARCHAR(64) NOT NULL,
  sgpa DOUBLE NOT NULL,
  cumulative_cgpa DOUBLE NOT NULL,
  total_credits INT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS past_subjects (
  id BIGINT NOT NULL AUTO_INCREMENT,
  semester_id BIGINT NOT NULL,
  code VARCHAR(32) NOT NULL,
  name VARCHAR(128) NOT NULL,
  credits INT NOT NULL,
  grade VARCHAR(16) NOT NULL,
  grade_points INT NOT NULL,
  is_arrear TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

-- 11. Student Settings
CREATE TABLE IF NOT EXISTS student_settings (
  student_id VARCHAR(64) NOT NULL,
  attendance_threshold INT NOT NULL DEFAULT 75,
  target_cgpa DOUBLE NOT NULL DEFAULT 8.5,
  daily_study_hours INT NOT NULL DEFAULT 4,
  internal_weight INT NOT NULL DEFAULT 50,
  end_sem_weight INT NOT NULL DEFAULT 50,
  email_alerts_json TEXT,
  theme VARCHAR(32) NOT NULL DEFAULT 'system',
  PRIMARY KEY (student_id)
);

-- 12. Student Requests & Clearance Workflow
CREATE TABLE IF NOT EXISTS student_requests (
  id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  type VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Submitted',
  submitted_date VARCHAR(16) NOT NULL,
  details_json TEXT,
  verification_token VARCHAR(128) NOT NULL,
  od_days_credited INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS request_comments (
  id BIGINT NOT NULL AUTO_INCREMENT,
  request_id VARCHAR(64) NOT NULL,
  author_role VARCHAR(64) NOT NULL,
  author VARCHAR(128) NOT NULL,
  comment TEXT NOT NULL,
  log_date VARCHAR(32) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS request_dept_stages (
  id BIGINT NOT NULL AUTO_INCREMENT,
  request_id VARCHAR(64) NOT NULL,
  department VARCHAR(64) NOT NULL,
  cleared TINYINT(1) NOT NULL DEFAULT 0,
  cleared_at VARCHAR(32),
  remarks VARCHAR(255),
  PRIMARY KEY (id)
);

-- 13. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  type VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notif_date VARCHAR(64) NOT NULL,
  read_status TINYINT(1) NOT NULL DEFAULT 0,
  link VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- 14. Badges & Unlocked Badges
CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(64) NOT NULL,
  title VARCHAR(128) NOT NULL,
  description VARCHAR(255) NOT NULL,
  icon_name VARCHAR(64) NOT NULL,
  hint VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS student_badges (
  id BIGINT NOT NULL AUTO_INCREMENT,
  student_id VARCHAR(64) NOT NULL,
  badge_id VARCHAR(64) NOT NULL,
  unlocked TINYINT(1) NOT NULL DEFAULT 1,
  unlocked_at VARCHAR(32),
  PRIMARY KEY (id),
  UNIQUE (student_id, badge_id)
);

-- 15. Notes & Community Hub
CREATE TABLE IF NOT EXISTS notes (
  id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  subject_code VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_type VARCHAR(32) NOT NULL,
  uploaded_by VARCHAR(128) NOT NULL,
  uploaded_date VARCHAR(32) NOT NULL,
  upvotes INT NOT NULL DEFAULT 0,
  file_content LONGBLOB,
  file_name VARCHAR(255),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS note_upvotes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  note_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (note_id, student_id)
);

-- 16. Faculty Directory
CREATE TABLE IF NOT EXISTS faculty (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(128) NOT NULL,
  designation VARCHAR(128) NOT NULL,
  department VARCHAR(128) NOT NULL,
  email VARCHAR(128) NOT NULL,
  cabin VARCHAR(64) NOT NULL,
  specializations_json TEXT,
  bio TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS faculty_office_hours (
  id BIGINT NOT NULL AUTO_INCREMENT,
  faculty_id VARCHAR(64) NOT NULL,
  day_of_week VARCHAR(16) NOT NULL,
  start_time VARCHAR(16) NOT NULL,
  end_time VARCHAR(16) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS faculty_subjects (
  id BIGINT NOT NULL AUTO_INCREMENT,
  faculty_id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  subject_code VARCHAR(32) NOT NULL,
  subject_name VARCHAR(128) NOT NULL,
  PRIMARY KEY (id)
);

-- 17. Fees, Receipts, Payment Orders
CREATE TABLE IF NOT EXISTS fee_structures (
  id VARCHAR(64) NOT NULL,
  semester INT NOT NULL,
  component VARCHAR(128) NOT NULL,
  amount DOUBLE NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  semester INT NOT NULL,
  amount DOUBLE NOT NULL,
  mode VARCHAR(32) NOT NULL,
  reference_number VARCHAR(128) NOT NULL,
  paid_at VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL,
  description VARCHAR(255) NOT NULL,
  last4 VARCHAR(4),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS fee_receipts (
  id VARCHAR(64) NOT NULL,
  payment_id VARCHAR(64) NOT NULL,
  receipt_number VARCHAR(64) NOT NULL,
  verify_token VARCHAR(128) NOT NULL,
  college_name VARCHAR(128) NOT NULL,
  student_name VARCHAR(128) NOT NULL,
  register_number VARCHAR(32) NOT NULL,
  department VARCHAR(128) NOT NULL,
  semester INT NOT NULL,
  amount DOUBLE NOT NULL,
  paid_date VARCHAR(64) NOT NULL,
  payment_mode VARCHAR(32) NOT NULL,
  payment_ref VARCHAR(128) NOT NULL,
  description VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS payment_orders (
  id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  semester INT NOT NULL,
  amount DOUBLE NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'INR',
  status VARCHAR(32) NOT NULL DEFAULT 'CREATED',
  idempotency_key VARCHAR(128),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- 18. Course Feedback (Anonymity by Design: responses separated from student receipts)
CREATE TABLE IF NOT EXISTS feedback_forms (
  id VARCHAR(64) NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  subject_code VARCHAR(32) NOT NULL,
  subject_name VARCHAR(128) NOT NULL,
  faculty_id VARCHAR(64) NOT NULL,
  faculty_name VARCHAR(128) NOT NULL,
  opens_at VARCHAR(32) NOT NULL,
  closes_at VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS feedback_questions (
  id VARCHAR(64) NOT NULL,
  category VARCHAR(64) NOT NULL,
  text VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS feedback_submissions (
  id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  form_id VARCHAR(64) NOT NULL,
  submitted_at VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (student_id, form_id)
);

CREATE TABLE IF NOT EXISTS feedback_responses (
  id VARCHAR(64) NOT NULL,
  form_id VARCHAR(64) NOT NULL,
  answers_json TEXT,
  comment TEXT,
  created_at VARCHAR(64) NOT NULL,
  PRIMARY KEY (id)
);

-- 19. Helpdesk Tickets & Comments
CREATE TABLE IF NOT EXISTS helpdesk_tickets (
  id VARCHAR(64) NOT NULL,
  ticket_number VARCHAR(32) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  category VARCHAR(64) NOT NULL,
  priority VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Open',
  assigned_department VARCHAR(128) NOT NULL,
  rating INT,
  created_at VARCHAR(64) NOT NULL,
  updated_at VARCHAR(64) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS helpdesk_comments (
  id VARCHAR(64) NOT NULL,
  ticket_id VARCHAR(64) NOT NULL,
  author_type VARCHAR(32) NOT NULL,
  author_name VARCHAR(128) NOT NULL,
  message TEXT NOT NULL,
  created_at VARCHAR(64) NOT NULL,
  PRIMARY KEY (id)
);
