-- MySQL schema for project management system

CREATE DATABASE IF NOT EXISTS project_management;
USE project_management;

-- Users table for authentication and user management
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  avatar TEXT,
  country VARCHAR(100),
  status TINYINT DEFAULT 1,
  role TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role)
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  name VARCHAR(255),
  dob DATE,
  gender VARCHAR(50),
  phone VARCHAR(50),
  email VARCHAR(255),
  job_sites TEXT,
  country VARCHAR(100),
  summary TEXT,
  bio TEXT,
  job_title VARCHAR(255),
  experience_level VARCHAR(100),
  preferred_salary VARCHAR(100),
  location VARCHAR(255),
  skills TEXT,
  education TEXT,
  experience TEXT,
  user VARCHAR(36),
  FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user)
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  profile VARCHAR(36),
  user VARCHAR(36) NOT NULL,
  job_description TEXT,
  resume TEXT,
  resume_pdf_path VARCHAR(500),
  job_link TEXT,
  company VARCHAR(255),
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'applied',
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user),
  INDEX idx_profile (profile),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status)
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  proposal VARCHAR(36),
  meeting_link TEXT,
  meeting_date TIMESTAMP,
  interviewer VARCHAR(255),
  progress TINYINT DEFAULT 0,
  meeting_title VARCHAR(255),
  user VARCHAR(36),
  profile VARCHAR(36),
  job_description TEXT,
  notes TEXT,
  feedback TEXT,
  selected_resume_id VARCHAR(36),
  resume_link TEXT,
  FOREIGN KEY (profile) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (proposal) REFERENCES proposals(id) ON DELETE CASCADE,
  FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (selected_resume_id) REFERENCES saved_resumes(id) ON DELETE SET NULL,
  INDEX idx_user (user),
  INDEX idx_profile (profile),
  INDEX idx_proposal (proposal),
  INDEX idx_meeting_date (meeting_date),
  INDEX idx_progress (progress),
  INDEX idx_selected_resume (selected_resume_id)
);

-- Sessions table for JWT token management
CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  refresh_token VARCHAR(512) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_refresh_token (refresh_token),
  INDEX idx_expires_at (expires_at)
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
);

-- Saved resumes table for storing modified resumes linked to job applications
CREATE TABLE IF NOT EXISTS saved_resumes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user VARCHAR(36) NOT NULL,
  profile VARCHAR(36) NOT NULL,
  original_resume TEXT NOT NULL,
  modified_resume TEXT NOT NULL,
  job_description TEXT NOT NULL,
  company VARCHAR(255),
  job_link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (profile) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user (user),
  INDEX idx_profile (profile),
  INDEX idx_company (company),
  INDEX idx_created_at (created_at),
  INDEX idx_updated_at (updated_at)
);