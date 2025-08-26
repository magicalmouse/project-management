require("dotenv").config();
const mysql = require("mysql2/promise");

async function createSavedResumesTable() {
	try {
		console.log("Creating saved_resumes table...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
		});

		console.log("✅ Connected to database!");

		// Create saved_resumes table
		const createTableQuery = `
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
			)
		`;

		await connection.execute(createTableQuery);
		console.log("✅ saved_resumes table created successfully!");

		// Verify table exists
		const [tables] = await connection.execute("SHOW TABLES LIKE 'saved_resumes'");
		if (tables.length > 0) {
			console.log("✅ saved_resumes table verified!");
		} else {
			console.log("❌ saved_resumes table not found after creation");
		}

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to create saved_resumes table:");
		console.error("Error:", error.message);
	}
}

createSavedResumesTable();
