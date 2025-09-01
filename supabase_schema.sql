-- Supabase PostgreSQL Schema for Project Management System
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    profile_picture VARCHAR(255),
    phone VARCHAR(20),
    department VARCHAR(50),
    position VARCHAR(50)
);

-- Create projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    spent_budget DECIMAL(15,2) DEFAULT 0,
    progress DECIMAL(5,2) DEFAULT 0,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create job_applications table
CREATE TABLE job_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(100) NOT NULL,
    position_title VARCHAR(100) NOT NULL,
    application_date DATE,
    status VARCHAR(30) DEFAULT 'applied' CHECK (status IN ('applied', 'interview_scheduled', 'interviewed', 'offer_received', 'rejected', 'withdrawn')),
    job_description TEXT,
    salary_range VARCHAR(50),
    location VARCHAR(100),
    application_url VARCHAR(500),
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create interviews table
CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    job_application_id INTEGER REFERENCES job_applications(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    interview_type VARCHAR(20) DEFAULT 'video' CHECK (interview_type IN ('phone', 'video', 'in_person', 'technical', 'panel')),
    scheduled_date TIMESTAMP,
    duration_minutes INTEGER DEFAULT 60,
    interviewer_name VARCHAR(100),
    interviewer_email VARCHAR(100),
    location VARCHAR(200),
    meeting_link VARCHAR(500),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    notes TEXT,
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create saved_resumes table
CREATE TABLE saved_resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    resume_json JSONB,
    file_path VARCHAR(500),
    file_type VARCHAR(10) DEFAULT 'pdf' CHECK (file_type IN ('pdf', 'docx', 'txt')),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create proposals table
CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    saved_resume_id INTEGER REFERENCES saved_resumes(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    client_name VARCHAR(100),
    project_description TEXT,
    proposal_content TEXT,
    budget_amount DECIMAL(15,2),
    timeline VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'negotiating')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create activity_logs table for audit trail
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create sessions table for JWT token management
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_interviews_job_application_id ON interviews(job_application_id);
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_scheduled_date ON interviews(scheduled_date);
CREATE INDEX idx_saved_resumes_user_id ON saved_resumes(user_id);
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_resumes_updated_at BEFORE UPDATE ON saved_resumes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
-- Note: Change this password immediately after first login
INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES 
('admin', 'admin@projectmanagement.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', TRUE);

-- Insert sample data for demonstration
INSERT INTO projects (name, description, status, priority, start_date, end_date, budget, created_by, assigned_to) VALUES 
('Project Management System', 'Development of a comprehensive project management dashboard', 'active', 'high', '2024-01-01', '2024-06-30', 50000.00, 1, 1),
('Mobile App Development', 'Cross-platform mobile application for client management', 'planning', 'medium', '2024-02-01', '2024-08-31', 75000.00, 1, 1);

INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by, due_date, estimated_hours) VALUES 
(1, 'Setup Database Schema', 'Design and implement the database schema for the project management system', 'completed', 'high', 1, 1, '2024-01-15 17:00:00', 16.0),
(1, 'Develop User Authentication', 'Implement secure user authentication and authorization system', 'in_progress', 'high', 1, 1, '2024-01-30 17:00:00', 24.0),
(1, 'Create Dashboard UI', 'Design and develop the main dashboard interface', 'todo', 'medium', 1, 1, '2024-02-15 17:00:00', 32.0);

-- Create a view for dashboard statistics
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM projects WHERE status = 'active') as active_projects,
    (SELECT COUNT(*) FROM tasks WHERE status IN ('todo', 'in_progress')) as pending_tasks,
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as active_users,
    (SELECT COUNT(*) FROM job_applications WHERE status = 'applied') as pending_applications,
    (SELECT COUNT(*) FROM interviews WHERE status = 'scheduled' AND scheduled_date > NOW()) as upcoming_interviews;

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Create policies (basic examples - customize as needed)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Note: You'll need to customize RLS policies based on your authentication system