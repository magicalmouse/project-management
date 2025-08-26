require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("node:fs");
const path = require("node:path");
const { getScheduledResumePDF } = require("./utils/scheduleResumeUtils");

async function testDownload() {
	try {
		console.log("🧪 Testing PDF download endpoint...");

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
			SELECT i.id, i.meeting_title, sr.company
			FROM interviews i
			JOIN saved_resumes sr ON i.selected_resume_id = sr.id
			WHERE sr.company LIKE '%Phoenix%'
		`);

		if (interviews.length > 0) {
			const interview = interviews[0];
			console.log(`\n📋 Testing download for: ${interview.meeting_title} (${interview.company})`);
			console.log(`Interview ID: ${interview.id}`);

			// Test the download function
			const pdfBuffer = await getScheduledResumePDF(interview.id);

			if (pdfBuffer) {
				console.log(`✅ PDF buffer retrieved: ${pdfBuffer.length} bytes`);

				// Compare with original
				const originalPath = path.join(__dirname, "uploads/resumes/2025-08-21_Phoenix_Support_Serv_The_WordPress_Full_Stack_Devel_1755786753693.pdf");
				const originalBuffer = fs.readFileSync(originalPath);

				console.log(`📊 Original PDF: ${originalBuffer.length} bytes`);
				console.log(`📊 Downloaded PDF: ${pdfBuffer.length} bytes`);
				console.log(`🔍 Content matches: ${originalBuffer.equals(pdfBuffer) ? "✅ YES" : "❌ NO"}`);

				if (originalBuffer.equals(pdfBuffer)) {
					console.log("\n🎉 SUCCESS: The download endpoint is serving your original PDF file!");
					console.log("📥 The file you download should be identical to your original upload.");
				} else {
					console.log("\n⚠️ WARNING: The download endpoint is serving a different file!");
				}
			} else {
				console.log("❌ No PDF buffer returned from download function");
			}
		}

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to test download:");
		console.error("Error:", error.message);
	}
}

// Run the function
testDownload();
