-- VPS Database Setup Script
-- Run this on your VPS MySQL after creating the database and user

USE project_management;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    profile_picture VARCHAR(255),
    phone VARCHAR(20),
    department VARCHAR(50),
    position VARCHAR(50)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    spent_budget DECIMAL(15,2) DEFAULT 0,
    progress DECIMAL(5,2) DEFAULT 0,
    created_by INT,
    assigned_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('todo', 'in_progress', 'review', 'completed', 'cancelled') DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    assigned_to INT,
    created_by INT,
    due_date DATETIME,
    completed_at TIMESTAMP NULL,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    company_name VARCHAR(100) NOT NULL,
    position_title VARCHAR(100) NOT NULL,
    application_date DATE,
    status ENUM('applied', 'interview_scheduled', 'interviewed', 'offer_received', 'rejected', 'withdrawn') DEFAULT 'applied',
    job_description TEXT,
    salary_range VARCHAR(50),
    location VARCHAR(100),
    application_url VARCHAR(500),
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_application_id INT,
    user_id INT,
    interview_type ENUM('phone', 'video', 'in_person', 'technical', 'panel') DEFAULT 'video',
    scheduled_date DATETIME,
    duration_minutes INT DEFAULT 60,
    interviewer_name VARCHAR(100),
    interviewer_email VARCHAR(100),
    location VARCHAR(200),
    meeting_link VARCHAR(500),
    status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
    notes TEXT,
    feedback TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create saved_resumes table
CREATE TABLE IF NOT EXISTS saved_resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    resume_json JSON,
    file_path VARCHAR(500),
    file_type ENUM('pdf', 'docx', 'txt') DEFAULT 'pdf',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    saved_resume_id INT,
    title VARCHAR(200) NOT NULL,
    client_name VARCHAR(100),
    project_description TEXT,
    proposal_content TEXT,
    budget_amount DECIMAL(15,2),
    timeline VARCHAR(100),
    status ENUM('draft', 'sent', 'accepted', 'rejected', 'negotiating') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (saved_resume_id) REFERENCES saved_resumes(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_saved_resumes_user_id ON saved_resumes(user_id);
CREATE INDEX idx_proposals_user_id ON proposals(user_id);

-- Insert default admin user (password: admin123)
-- Note: Change this password immediately after first login
INSERT IGNORE INTO users (username, email, password_hash, full_name, role, is_active) VALUES 
('admin', 'admin@projectmanagement.com', '$2b$10$rQZ9vQZ9vQZ9vQZ9vQZ9vOZ9vQZ9vQZ9vQZ9vQZ9vQZ9vQZ9vQZ9v', 'System Administrator', 'admin', TRUE);

-- Insert sample data
INSERT IGNORE INTO projects (name, description, status, priority, start_date, end_date, budget, created_by, assigned_to) VALUES 
('Project Management System', 'Development of a comprehensive project management dashboard', 'active', 'high', '2024-01-01', '2024-06-30', 50000.00, 1, 1);

INSERT IGNORE INTO tasks (project_id, title, description, status, priority, assigned_to, created_by, due_date, estimated_hours) VALUES 
(1, 'Setup Database Schema', 'Design and implement the database schema', 'completed', 'high', 1, 1, '2024-01-15 17:00:00', 16.0),
(1, 'Develop User Authentication', 'Implement secure user authentication system', 'in_progress', 'high', 1, 1, '2024-01-30 17:00:00', 24.0);

SELECT 'Database setup completed successfully!' as message;