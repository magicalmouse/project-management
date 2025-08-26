const { query } = require("./db");
const jwt = require("jsonwebtoken");

async function testInterviewEndpoint() {
	try {
		console.log("🧪 Testing interview PDF endpoint...\n");

		// Get a valid user and interview
		const users = await query("SELECT id, email FROM users LIMIT 1");
		if (users.length === 0) {
			console.log("❌ No users found");
			return;
		}

		const user = users[0];
		console.log("👤 Using user:", user.email);

		// Create a valid token
		const token = jwt.sign({ userId: user.id, email: user.email, role: 1 }, process.env.JWT_SECRET || "your-secret-key-change-this-in-production", {
			expiresIn: "24h",
		});

		console.log("🔐 Generated token:", `${token.substring(0, 50)}...`);

		// Get interview
		const interviews = await query("SELECT id FROM interviews LIMIT 1");
		if (interviews.length === 0) {
			console.log("❌ No interviews found");
			return;
		}

		const interviewId = interviews[0].id;
		console.log("📋 Using interview ID:", interviewId);

		// Test the endpoint
		const http = require("node:http");
		const url = `http://localhost:4000/api/interviews/${interviewId}/scheduled-resume-pdf?token=${token}`;

		console.log("🔗 Testing URL:", url);

		const req = http.get(url, (res) => {
			console.log("📡 Response status:", res.statusCode);
			console.log("📡 Response headers:", res.headers);

			let data = "";
			res.on("data", (chunk) => {
				data += chunk;
			});

			res.on("end", () => {
				if (res.statusCode === 200) {
					console.log("✅ Success! PDF data length:", data.length);
				} else {
					console.log("❌ Error response:", data);
				}
			});
		});

		req.on("error", (error) => {
			console.error("❌ Request error:", error.message);
		});
	} catch (error) {
		console.error("❌ Test error:", error);
	}
}

testInterviewEndpoint();
