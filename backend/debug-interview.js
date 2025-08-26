const { query } = require("./db");
const jwt = require("jsonwebtoken");
const fs = require("node:fs");
const path = require("node:path");

async function debugInterviewEndpoint() {
	try {
		console.log("🔍 Debugging interview PDF endpoint...\n");

		// Step 1: Get user
		const users = await query("SELECT id, email FROM users LIMIT 1");
		const user = users[0];
		console.log("✅ Step 1 - User found:", user.email);

		// Step 2: Create token
		const token = jwt.sign({ userId: user.id, email: user.email, role: 1 }, process.env.JWT_SECRET || "your-secret-key-change-this-in-production", {
			expiresIn: "24h",
		});
		console.log("✅ Step 2 - Token created");

		// Step 3: Get interview
		const interviews = await query("SELECT id, meeting_title, meeting_date, selected_resume_id FROM interviews LIMIT 1");
		const interview = interviews[0];
		console.log("✅ Step 3 - Interview found:", interview.id);

		// Step 4: Get saved resume
		const savedResumes = await query("SELECT id, company FROM saved_resumes WHERE id = ?", [interview.selected_resume_id]);
		const savedResume = savedResumes[0];
		console.log("✅ Step 4 - Saved resume found:", savedResume.company);

		// Step 5: Check schedule directory
		const scheduleResumesDir = path.join(__dirname, "uploads", "schedule", "resumes");
		console.log("📁 Schedule directory:", scheduleResumesDir);

		if (!fs.existsSync(scheduleResumesDir)) {
			console.log("❌ Step 5 - Schedule directory does not exist");
			return;
		}
		console.log("✅ Step 5 - Schedule directory exists");

		// Step 6: List files in directory
		const files = fs.readdirSync(scheduleResumesDir);
		console.log("📄 Files in directory:", files);

		// Step 7: Test file pattern matching
		const date = new Date(interview.meeting_date).toISOString().split("T")[0];
		const meetingTitle = interview.meeting_title.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 30);
		const companyName = savedResume.company ? savedResume.company.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 20) : "Unknown";

		const expectedPattern = `schedule_${date}_${meetingTitle}_${companyName}`;
		console.log("🔍 Expected pattern:", expectedPattern);

		const matchingFile = files.find((file) => file.startsWith(expectedPattern) && file.endsWith(".pdf"));

		if (!matchingFile) {
			console.log("❌ Step 7 - No matching file found");
			console.log("🔍 Checking each file:");
			for (const file of files) {
				console.log(`   ${file} - starts with pattern: ${file.startsWith(expectedPattern)}`);
			}
			return;
		}
		console.log("✅ Step 7 - Matching file found:", matchingFile);

		// Step 8: Check file exists
		const scheduledPdfPath = path.join(scheduleResumesDir, matchingFile);
		if (!fs.existsSync(scheduledPdfPath)) {
			console.log("❌ Step 8 - File does not exist on disk");
			return;
		}
		console.log("✅ Step 8 - File exists on disk");

		// Step 9: Try to read file
		try {
			const pdfBuffer = fs.readFileSync(scheduledPdfPath);
			console.log("✅ Step 9 - File read successfully, size:", pdfBuffer.length);
		} catch (error) {
			console.log("❌ Step 9 - Error reading file:", error.message);
		}

		console.log("\n🎉 All steps completed successfully!");
	} catch (error) {
		console.error("❌ Debug error:", error);
	}
}

debugInterviewEndpoint();
