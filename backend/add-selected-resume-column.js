const mysql = require("mysql2/promise");
require("dotenv").config();

async function addSelectedResumeColumn() {
	try {
		console.log("Adding selected_resume_id column to interviews table...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
		});

		console.log("✅ Connected to database!");

		// Check if column already exists
		const [columns] = await connection.execute("SHOW COLUMNS FROM interviews LIKE 'selected_resume_id'");

		if (columns.length > 0) {
			console.log("✅ selected_resume_id column already exists!");
			await connection.end();
			return;
		}

		// Add the column
		await connection.execute(`
			ALTER TABLE interviews 
			ADD COLUMN selected_resume_id VARCHAR(36),
			ADD INDEX idx_selected_resume (selected_resume_id),
			ADD CONSTRAINT fk_interviews_selected_resume 
			FOREIGN KEY (selected_resume_id) REFERENCES saved_resumes(id) ON DELETE SET NULL
		`);

		console.log("✅ selected_resume_id column added successfully!");

		// Verify the column was added
		const [newColumns] = await connection.execute("SHOW COLUMNS FROM interviews LIKE 'selected_resume_id'");

		if (newColumns.length > 0) {
			console.log("✅ selected_resume_id column verified!");
		} else {
			console.log("❌ selected_resume_id column not found after creation");
		}

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to add selected_resume_id column:");
		console.error("Error:", error.message);
	}
}

// Run the function
addSelectedResumeColumn();
