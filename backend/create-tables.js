require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("node:fs");
const path = require("node:path");

async function createTables() {
	try {
		console.log("Creating database tables...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
			multipleStatements: true,
		});

		console.log("✅ Connected to database!");

		// Read the schema file
		const schemaPath = path.join(__dirname, "..", "src", "api", "database", "schema.sql");
		const schema = fs.readFileSync(schemaPath, "utf8");

		// Split and execute SQL statements
		const statements = schema.split(";").filter((stmt) => stmt.trim().length > 0);

		for (const statement of statements) {
			if (statement.trim()) {
				await connection.execute(statement.trim());
			}
		}

		console.log("✅ Database tables created successfully!");

		// Verify tables exist
		const [tables] = await connection.execute("SHOW TABLES");
		console.log(
			"Created tables:",
			tables.map((t) => Object.values(t)[0]),
		);

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to create tables:");
		console.error("Error:", error.message);
	}
}

createTables();
