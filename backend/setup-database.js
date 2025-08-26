require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("node:fs");
const path = require("node:path");

async function setupDatabase() {
	try {
		console.log("Setting up database...");

		// First, connect without specifying database to create it
		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			port: Number.parseInt(process.env.DB_PORT),
			multipleStatements: true,
		});

		console.log("✅ Connected to MySQL server!");

		// Create database if it doesn't exist
		await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
		console.log(`✅ Database '${process.env.DB_NAME}' ready!`);

		// Use the database
		await connection.execute(`USE ${process.env.DB_NAME}`);

		// Read the schema file
		const schemaPath = path.join(__dirname, "..", "src", "api", "database", "schema.sql");
		const schema = fs.readFileSync(schemaPath, "utf8");

		// Remove CREATE DATABASE and USE statements from schema
		const cleanSchema = schema
			.replace(/CREATE DATABASE IF NOT EXISTS [^;]+;/gi, "")
			.replace(/USE [^;]+;/gi, "")
			.trim();

		// Split and execute SQL statements
		const statements = cleanSchema.split(";").filter((stmt) => stmt.trim().length > 0);

		for (const statement of statements) {
			if (statement.trim()) {
				try {
					await connection.execute(statement.trim());
					console.log(`✅ Executed: ${statement.trim().substring(0, 50)}...`);
				} catch (stmtError) {
					console.error(`❌ Failed to execute statement: ${statement.trim().substring(0, 50)}...`);
					console.error("Error:", stmtError.message);
				}
			}
		}

		console.log("✅ Database setup completed!");

		// Verify tables exist
		const [tables] = await connection.execute("SHOW TABLES");
		console.log(
			"Created tables:",
			tables.map((t) => Object.values(t)[0]),
		);

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to setup database:");
		console.error("Error:", error.message);
	}
}

setupDatabase();
