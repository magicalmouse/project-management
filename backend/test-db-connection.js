const { query } = require("./db");

async function testDatabaseConnection() {
	try {
		console.log("Testing database connection...");

		// Test basic query
		const result = await query("SELECT 1 as test");
		console.log("✅ Database connection successful:", result);

		// Test proposals table
		const proposals = await query("SELECT COUNT(*) as count FROM proposals");
		console.log("✅ Proposals table accessible:", proposals);

		// Test users table
		const users = await query("SELECT COUNT(*) as count FROM users");
		console.log("✅ Users table accessible:", users);
	} catch (error) {
		console.error("❌ Database connection failed:", error);
	}
}

testDatabaseConnection();
