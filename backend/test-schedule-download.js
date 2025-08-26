require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("node:fs");
const path = require("node:path");

async function testScheduleDownload() {
	try {
		console.log("🧪 Testing schedule folder PDF download...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
		});

		console.log("✅ Connected to database!");

		// Get the Phoenix interview
		const [interviews] = await connection.execute(`
			SELECT i.id, i.meeting_title, i.meeting_date, sr.company
			FROM interviews i
			JOIN saved_resumes sr ON i.selected_resume_id = sr.id
			WHERE sr.company LIKE '%Phoenix%'
		`);

		if (interviews.length > 0) {
			const interview = interviews[0];
			console.log(`\n📋 Testing download for: ${interview.meeting_title} (${interview.company})`);
			console.log(`Interview ID: ${interview.id}`);
			console.log(`Meeting Date: ${interview.meeting_date}`);

			// Construct the expected filename in the schedule folder
			const date = new Date(interview.meeting_date).toISOString().split("T")[0];
			const meetingTitle = interview.meeting_title.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 30);
			const companyName = interview.company ? interview.company.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 20) : "Unknown";

			console.log(`📅 Date: ${date}`);
			console.log(`📝 Meeting Title: ${meetingTitle}`);
			console.log(`🏢 Company: ${companyName}`);

			// Look for the PDF file in the schedule/resumes directory
			const scheduleResumesDir = path.join(__dirname, "uploads", "schedule", "resumes");
			const files = fs.readdirSync(scheduleResumesDir);
			const expectedPattern = `schedule_${date}_${meetingTitle}_${companyName}_`;

			console.log(`🔍 Looking for pattern: ${expectedPattern}`);

			const matchingFile = files.find((file) => file.startsWith(expectedPattern) && file.endsWith(".pdf"));

			if (matchingFile) {
				console.log(`✅ Found matching file: ${matchingFile}`);

				const scheduledPdfPath = path.join(scheduleResumesDir, matchingFile);
				const stats = fs.statSync(scheduledPdfPath);

				console.log(`📊 File size: ${stats.size} bytes`);
				console.log(`🕒 Modified: ${stats.mtime}`);

				// Compare with original
				const originalPath = path.join(__dirname, "uploads/resumes/2025-08-21_Phoenix_Support_Serv_The_WordPress_Full_Stack_Devel_1755786753693.pdf");
				const originalBuffer = fs.readFileSync(originalPath);
				const scheduleBuffer = fs.readFileSync(scheduledPdfPath);

				console.log(`📊 Original PDF: ${originalBuffer.length} bytes`);
				console.log(`📊 Schedule PDF: ${scheduleBuffer.length} bytes`);
				console.log(`🔍 Content matches: ${originalBuffer.equals(scheduleBuffer) ? "✅ YES" : "❌ NO"}`);

				if (originalBuffer.equals(scheduleBuffer)) {
					console.log("\n🎉 SUCCESS: The schedule PDF is identical to your original upload!");
					console.log("📥 This is the file that will be downloaded when you click the button.");
				} else {
					console.log("\n⚠️ WARNING: The schedule PDF differs from your original upload!");
				}
			} else {
				console.log("❌ No matching file found in schedule folder");
				console.log("📁 Available files:");
				for (const f of files.filter((f) => f.includes("Phoenix"))) {
					console.log(`   - ${f}`);
				}
			}
		}

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to test schedule download:");
		console.error("Error:", error.message);
	}
}

// Run the function
testScheduleDownload();
