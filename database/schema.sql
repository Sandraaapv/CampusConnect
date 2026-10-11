-- ====================================================================
-- CampusConnect Production / Local MySQL Schema
-- Database: campusconnect
-- Compatible with MySQL 8.0+
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `campusconnect`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `campusconnect`;

-- --------------------------------------------------------------------
-- 1. Create Dedicated Application User & Grant Privileges
-- --------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'campusconnect'@'localhost' IDENTIFIED BY 'campusconnect_secret';
CREATE USER IF NOT EXISTS 'campusconnect'@'%' IDENTIFIED BY 'campusconnect_secret';

GRANT ALL PRIVILEGES ON `campusconnect`.* TO 'campusconnect'@'localhost';
GRANT ALL PRIVILEGES ON `campusconnect`.* TO 'campusconnect'@'%';
FLUSH PRIVILEGES;

-- --------------------------------------------------------------------
-- 2. Official Student Registry Table
-- Required for validating student self-registration against college records
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_records` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `register_number` VARCHAR(32) NOT NULL,
  `email` VARCHAR(128) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `department` VARCHAR(128) NOT NULL,
  `semester` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_regno` (`register_number`),
  UNIQUE KEY `uk_student_email` (`email`),
  INDEX `idx_student_regno` (`register_number`),
  INDEX `idx_student_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. Users Table (Student Accounts)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `student_record_id` BIGINT NOT NULL,
  `email` VARCHAR(128) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `email_verified_at` DATETIME NULL,
  `failed_attempts` INT NOT NULL DEFAULT 0,
  `locked_until` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_email` (`email`),
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_student_record` (`student_record_id`),
  CONSTRAINT `fk_users_student_record`
    FOREIGN KEY (`student_record_id`)
    REFERENCES `student_records` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. Captcha Challenges Table (Self-hosted single-use visual & audio captcha)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `captcha_challenges` (
  `id` VARCHAR(64) NOT NULL,
  `answer_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_captcha_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. OTP Codes Table (Email Verification & Password Reset)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `otp_codes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(64) NOT NULL,
  `purpose` VARCHAR(32) NOT NULL,
  `code_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `used` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_otp_user_purpose` (`user_id`, `purpose`),
  INDEX `idx_otp_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. Refresh Tokens Table (Rotating Refresh Tokens with Family IDs)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` VARCHAR(64) NOT NULL,
  `family_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `device_info` VARCHAR(255) NULL,
  `ip` VARCHAR(64) NULL,
  `expires_at` DATETIME NOT NULL,
  `revoked_at` DATETIME NULL,
  `replaced_by` VARCHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_active_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_refresh_token_hash` (`token_hash`),
  INDEX `idx_refresh_user` (`user_id`),
  INDEX `idx_refresh_family` (`family_id`),
  INDEX `idx_refresh_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. Password History Table (Enforces last 3 distinct passwords)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `password_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(64) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_password_history_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 8. Login Events Audit Log (Security Activity & Device History)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `login_events` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(64) NULL,
  `ip` VARCHAR(64) NULL,
  `device` VARCHAR(255) NULL,
  `success` TINYINT(1) NOT NULL,
  `reason` VARCHAR(128) NULL,
  `at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_login_event_user` (`user_id`),
  INDEX `idx_login_event_at` (`at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 9. Initial Seed Data (Enrolled Students & Demo User)
-- --------------------------------------------------------------------
INSERT INTO `student_records` (`register_number`, `email`, `name`, `department`, `semester`) VALUES
  ('21CS042', 'student.demo@campus.test', 'Arjun Verma', 'Computer Science & Engineering', 6),
  ('21CSC105', 'ananya.sen@campus.test', 'Ananya Sen', 'Computer Science & Engineering', 6),
  ('21CS077', 'rohit.sharma@campus.test', 'Rohit Sharma', 'Computer Science & Engineering', 6),
  ('21EC034', 'vikram.mehta@campus.test', 'Vikram Mehta', 'Electronics & Communication', 6),
  ('21ME019', 'sneha.patel@campus.test', 'Sneha Patel', 'Mechanical Engineering', 6)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `name` = VALUES(`name`);

-- Seed Pre-registered Demo Account: ID = 21CS042, Password = StudentDemo@2026!
-- BCrypt Hash: $2a$12$4e9E/u8B57zI96Jc4fX9zOU3BqW0cQY7o58M9xY6Lp9b6Q7m7w2vW
INSERT INTO `users` (`id`, `student_record_id`, `email`, `password_hash`, `email_verified_at`, `failed_attempts`, `locked_until`, `created_at`)
SELECT 
  'user-demo-21cs042',
  sr.`id`,
  sr.`email`,
  '$2a$12$4e9E/u8B57zI96Jc4fX9zOU3BqW0cQY7o58M9xY6Lp9b6Q7m7w2vW',
  NOW(),
  0,
  NULL,
  NOW()
FROM `student_records` sr
WHERE sr.`register_number` = '21CS042'
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);
