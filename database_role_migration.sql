-- Database Migration: Convert role column from VARCHAR to INTEGER
-- Run this in your Supabase SQL Editor

-- Step 1: Add a new temporary column for numeric roles
ALTER TABLE users ADD COLUMN role_numeric INTEGER DEFAULT 1;

-- Step 2: Convert existing string roles to numeric values
UPDATE users SET role_numeric = CASE 
    WHEN role = 'admin' THEN 0
    WHEN role = 'manager' THEN 1
    WHEN role = 'user' THEN 1
    ELSE 1
END;

-- Step 3: Drop the old role column
ALTER TABLE users DROP COLUMN role;

-- Step 4: Rename the new column to 'role'
ALTER TABLE users RENAME COLUMN role_numeric TO role;

-- Step 5: Add constraints to the new role column
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (0, 1));

-- Step 6: Add comment for clarity
COMMENT ON COLUMN users.role IS 'User role: 0=admin, 1=user';

-- Verify the migration
SELECT username, email, role, 
       CASE 
           WHEN role = 0 THEN 'admin'
           WHEN role = 1 THEN 'user'
           ELSE 'unknown'
       END as role_description
FROM users;