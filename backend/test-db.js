require("dotenv").config();
const { query } = require("./db");

async function testDatabase() {
	try {
		console.log("Testing database connection...");

		// Test basic connection
		const result = await query("SELECT 1 as test");
		console.log("✅ Database connection successful:", result);

		// Check if tables exist
		const tables = await query("SHOW TABLES");
		console.log(
			"✅ Tables found:",
			tables.map((t) => Object.values(t)[0]),
		);

		// Check users table
		const users = await query("SELECT id, email, username, role FROM users LIMIT 5");
		console.log("✅ Users found:", users.length);

		// Check proposals table
		const proposals = await query("SELECT id, user, company, status FROM proposals LIMIT 5");
		console.log("✅ Proposals found:", proposals.length);

		// Test the specific query from proposalController
		const testProposals = await query(`
			SELECT p.*, u.username, u.email,
				   pr.first_name, pr.last_name
			FROM proposals p
			JOIN users u ON p.user = u.id
			LEFT JOIN profiles pr ON p.user = pr.user
			ORDER BY p.created_at DESC
			LIMIT 10
		`);
		console.log("✅ Test query successful, found proposals:", testProposals.length);

		if (testProposals.length > 0) {
			console.log("Sample proposal:", {
				id: testProposals[0].id,
				company: testProposals[0].company,
				status: testProposals[0].status,
				username: testProposals[0].username,
			});
		}
	} catch (error) {
		console.error("❌ Database test failed:");
		console.error("Error:", error.message);
		console.error("Stack:", error.stack);
	}
}

testDatabase();
