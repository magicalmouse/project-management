const { query } = require("./db");
const jwt = require("jsonwebtoken");

// JWT Secret (should match your backend)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

async function testEndpoint() {
	try {
		console.log("🧪 Testing Interview Resume Endpoint...\n");

		// Get a test user and interview
		const users = await query("SELECT id, email, username, role FROM users LIMIT 1");
		if (users.length === 0) {
			console.log("❌ No users found");
			return;
		}

		const user = users[0];
		console.log(`👤 Using user: ${user.email}`);

		// Generate a test token
		const token = jwt.sign(
			{
				userId: user.id,
				email: user.email,
				role: user.role,
			},
			JWT_SECRET,
			{ expiresIn: "24h" },
		);

		// Get an interview
		const interviews = await query("SELECT id, meeting_title FROM interviews LIMIT 1");
		if (interviews.length === 0) {
			console.log("❌ No interviews found");
			return;
		}

		const interview = interviews[0];
		console.log(`📅 Found interview: ${interview.meeting_title}`);

		// Test URL
		const testUrl = `http://localhost:4000/api/interviews/${interview.id}/scheduled-resume-pdf?token=${encodeURIComponent(token)}`;
		console.log(`🔗 Test URL: ${testUrl}`);

		// Test with fetch
		const response = await fetch(testUrl);
		console.log(`📊 Status: ${response.status}`);
		console.log("📊 Headers:", Object.fromEntries(response.headers.entries()));

		if (response.ok) {
			const buffer = await response.arrayBuffer();
			console.log(`✅ Success! Size: ${buffer.byteLength} bytes`);
		} else {
			const text = await response.text();
			console.log(`❌ Error: ${text}`);
		}
	} catch (error) {
		console.error("❌ Test failed:", error.message);
	}
}

testEndpoint();
