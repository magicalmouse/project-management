require("dotenv").config();
const { query } = require("./db");
const { generateToken } = require("./middleware/auth");

async function testProposals() {
	try {
		console.log("Testing proposals endpoint...");

		// Get a test user
		const users = await query("SELECT id, email, username, role FROM users WHERE email = ?", ["test@example.com"]);
		if (users.length === 0) {
			console.error("❌ Test user not found");
			return;
		}

		const user = users[0];
		console.log("✅ Test user found:", user);

		// Generate token
		const token = generateToken(user);
		console.log("✅ Token generated");

		// Test the exact query from proposalController
		const { page = 1, limit = 10, status, company } = {};
		const offset = (page - 1) * limit;

		let whereClause = "";
		const queryParams = [];

		// Role-based filtering
		if (user.role !== 0) {
			whereClause = "WHERE p.user = ?";
			queryParams.push(user.id);
		}

		console.log("Where clause:", whereClause);
		console.log("Query params:", queryParams);

		const proposals = await query(
			`
			SELECT p.*, u.username, u.email,
				   pr.first_name, pr.last_name
			FROM proposals p
			JOIN users u ON p.user = u.id
			LEFT JOIN profiles pr ON p.user = pr.user
			${whereClause}
			ORDER BY p.created_at DESC
			LIMIT ? OFFSET ?
		`,
			[...queryParams, Number.parseInt(limit), offset],
		);

		console.log("✅ Proposals query successful");
		console.log("Found proposals:", proposals.length);

		if (proposals.length > 0) {
			console.log("Sample proposal:", {
				id: proposals[0].id,
				company: proposals[0].company,
				status: proposals[0].status,
				username: proposals[0].username,
			});
		}

		// Test count query
		const countResult = await query(
			`
			SELECT COUNT(*) as total
			FROM proposals p
			JOIN users u ON p.user = u.id
			${whereClause}
		`,
			queryParams,
		);

		console.log("✅ Count query successful");
		console.log("Total proposals:", countResult[0].total);
	} catch (error) {
		console.error("❌ Test failed:");
		console.error("Error:", error.message);
		console.error("Stack:", error.stack);
	}
}

testProposals();
