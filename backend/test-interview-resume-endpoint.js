const { query } = require("./db");
const jwt = require("jsonwebtoken");
const http = require("node:http");
const url = require("node:url");

// JWT Secret (should match your backend)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

async function testInterviewResumeEndpoint() {
	try {
		console.log("🧪 Testing Interview Resume PDF Endpoint...\n");

		// Use the specific user ID that has interviews
		const userId = "241d4d6d-7555-11f0-ae84-5254006a331e";
		const interviewId = "d9ea328a-25ce-48c0-9d02-9240040c3259";

		// Get the user details
		const users = await query("SELECT id, email, username, role FROM users WHERE id = ?", [userId]);
		if (users.length === 0) {
			console.log("❌ User not found");
			return;
		}

		const user = users[0];
		console.log(`👤 Using user: ${user.email} (ID: ${user.id})`);

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

		console.log(`🔐 Generated test token: ${token.substring(0, 50)}...`);

		// Verify the interview exists
		const interviews = await query("SELECT id, meeting_title, meeting_date FROM interviews WHERE id = ?", [interviewId]);

		if (interviews.length === 0) {
			console.log("❌ Interview not found");
			return;
		}

		const interview = interviews[0];
		console.log(`📅 Found interview: ${interview.meeting_title} (ID: ${interview.id})`);

		// Test the endpoint URL
		const endpointUrl = `http://localhost:4000/api/interviews/${interviewId}/scheduled-resume-pdf?token=${encodeURIComponent(token)}`;
		console.log(`🔗 Testing endpoint: ${endpointUrl}`);

		// Test with http module
		const parsedUrl = url.parse(endpointUrl);
		const options = {
			hostname: parsedUrl.hostname,
			port: parsedUrl.port,
			path: parsedUrl.path,
			method: "GET",
		};

		const req = http.request(options, (res) => {
			console.log(`📊 Response status: ${res.statusCode}`);
			console.log("📊 Response headers:", res.headers);

			let data = "";
			res.on("data", (chunk) => {
				data += chunk;
			});

			res.on("end", () => {
				if (res.statusCode === 200) {
					console.log(`✅ Success! Response size: ${data.length} bytes`);
					if (data.length > 100) {
						console.log(`📄 First 100 bytes: ${data.substring(0, 100)}`);
					}
				} else {
					console.log(`❌ Error: ${data}`);
				}
				console.log("\n✅ Test completed");
			});
		});

		req.on("error", (error) => {
			console.error("❌ Request failed:", error.message);
		});

		req.end();
	} catch (error) {
		console.error("❌ Test failed:", error);
	}
}

testInterviewResumeEndpoint();
