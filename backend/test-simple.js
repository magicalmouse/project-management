require("dotenv").config();
const { query } = require("./db");
const jwt = require("jsonwebtoken");
const fs = require("node:fs");
const path = require("node:path");

async function testSimple() {
	try {
		console.log("🧪 Testing simple logic...\n");

		// Get user and create token
		const users = await query("SELECT id, email FROM users LIMIT 1");
		const user = users[0];
		const token = jwt.sign({ userId: user.id, email: user.email, role: 1 }, process.env.JWT_SECRET || "your-secret-key-change-this-in-production", {
			expiresIn: "24h",
		});

		// Verify token (same as controller)
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-this-in-production");
			console.log("✅ Token verified for user:", decoded.userId);
		} catch (error) {
			console.log("❌ Token verification failed:", error.message);
			return;
		}

		// Get user from database (same as controller)
		const dbUsers = await query("SELECT id, email, username, role, status FROM users WHERE id = ?", [decoded.userId]);
		if (dbUsers.length === 0) {
			console.log("❌ User not found in database");
			return;
		}
		console.log("✅ User found in database:", dbUsers[0].email);

		// Get interview (same as controller)
		const interviewId = "d9ea328a-25ce-48c0-9d02-9240040c3259";
		const existingInterviews = await query("SELECT user FROM interviews WHERE id = ?", [interviewId]);
		if (existingInterviews.length === 0) {
			console.log("❌ Interview not found");
			return;
		}
		console.log("✅ Interview found");

		// Get interview details (same as controller)
		const interviews = await query(
			`
			SELECT i.meeting_title, i.meeting_date, sr.company
			FROM interviews i
			JOIN saved_resumes sr ON i.selected_resume_id = sr.id
			WHERE i.id = ?
		`,
			[interviewId],
		);

		if (interviews.length === 0) {
			console.log("❌ Interview details not found");
			return;
		}
		console.log("✅ Interview details found:", interviews[0]);

		// File matching logic (same as controller)
		const interview = interviews[0];
		const date = new Date(interview.meeting_date).toISOString().split("T")[0];
		const meetingTitle = interview.meeting_title.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 30);
		const companyName = interview.company ? interview.company.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 20) : "Unknown";

		const scheduleResumesDir = path.join(__dirname, "uploads", "schedule", "resumes");
		const files = fs.readdirSync(scheduleResumesDir);
		const expectedPattern = `schedule_${date}_${meetingTitle}_${companyName}`;

		const matchingFile = files.find((file) => file.startsWith(expectedPattern) && file.endsWith(".pdf"));

		if (!matchingFile) {
			console.log("❌ Matching file not found");
			return;
		}
		console.log("✅ Matching file found:", matchingFile);

		// Read file (same as controller)
		const scheduledPdfPath = path.join(scheduleResumesDir, matchingFile);
		const pdfBuffer = fs.readFileSync(scheduledPdfPath);
		console.log("✅ File read successfully, size:", pdfBuffer.length);

		console.log("\n🎉 All logic works correctly!");
	} catch (error) {
		console.error("❌ Error:", error);
	}
}

testSimple();
