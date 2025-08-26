require("dotenv").config();
const mysql = require("mysql2/promise");

async function addResumeJsonColumn() {
	try {
		console.log("Adding resume_json column to saved_resumes table...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
		});

		console.log("✅ Connected to database!");

		// Check if column already exists
		const [columns] = await connection.execute(
			`
			SELECT COLUMN_NAME 
			FROM INFORMATION_SCHEMA.COLUMNS 
			WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'saved_resumes' AND COLUMN_NAME = 'resume_json'
		`,
			[process.env.DB_NAME],
		);

		if (columns.length > 0) {
			console.log("✅ resume_json column already exists!");
		} else {
			// Add resume_json column
			const alterTableQuery = `
				ALTER TABLE saved_resumes 
				ADD COLUMN resume_json TEXT
			`;

			await connection.execute(alterTableQuery);
			console.log("✅ resume_json column added successfully!");
		}

		// Verify the column exists
		const [verifyColumns] = await connection.execute(
			`
			SELECT COLUMN_NAME, DATA_TYPE 
			FROM INFORMATION_SCHEMA.COLUMNS 
			WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'saved_resumes' AND COLUMN_NAME = 'resume_json'
		`,
			[process.env.DB_NAME],
		);

		if (verifyColumns.length > 0) {
			console.log("✅ resume_json column verified:", verifyColumns[0]);
		} else {
			console.log("❌ resume_json column not found after addition");
		}

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to add resume_json column:");
		console.error("Error:", error.message);
	}
}

addResumeJsonColumn();
