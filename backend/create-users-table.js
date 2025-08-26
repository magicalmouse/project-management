require("dotenv").config();
const mysql = require("mysql2/promise");

async function createUsersTable() {
	try {
		console.log("Creating users table...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
		});

		console.log("✅ Connected to database!");

		// Create users table
		await connection.execute(`
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
            )
        `);

		console.log("✅ Users table created!");

		// Test the table
		const [result] = await connection.execute("SELECT COUNT(*) as count FROM users");
		console.log("✅ Users table test:", result[0]);

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to create users table:");
		console.error("Error:", error.message);
	}
}

createUsersTable();
