const mysql = require("mysql2/promise");
require("dotenv").config();

async function addResumeLinkColumn() {
	try {
		console.log("Adding resume_link column to interviews table...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
		});

		console.log("✅ Connected to database!");

		// Check if column already exists
		const [columns] = await connection.execute("SHOW COLUMNS FROM interviews LIKE 'resume_link'");

		if (columns.length > 0) {
			console.log("✅ resume_link column already exists!");
			await connection.end();
			return;
		}

		// Add the column
		await connection.execute(`
			ALTER TABLE interviews 
			ADD COLUMN resume_link TEXT,
			ADD INDEX idx_resume_link (resume_link(255))
		`);

		console.log("✅ resume_link column added successfully!");

		// Verify the column was added
		const [newColumns] = await connection.execute("SHOW COLUMNS FROM interviews LIKE 'resume_link'");

		if (newColumns.length > 0) {
			console.log("✅ resume_link column verified!");
		} else {
			console.log("❌ resume_link column not found after creation");
		}

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to add resume_link column:");
		console.error("Error:", error.message);
	}
}

// Run the function
addResumeLinkColumn();
