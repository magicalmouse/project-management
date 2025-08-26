require("dotenv").config();
const mysql = require("mysql2/promise");
const { copyResumeToSchedule } = require("./utils/scheduleResumeUtils");

async function regenerateInterviewPDFs() {
	try {
		console.log("🔄 Regenerating PDF files for existing interviews...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
		});

		console.log("✅ Connected to database!");

		// Get all interviews that have selected resume IDs
		const [interviews] = await connection.execute(`
			SELECT i.id, i.meeting_title, i.selected_resume_id, sr.company
			FROM interviews i
			JOIN saved_resumes sr ON i.selected_resume_id = sr.id
			WHERE i.selected_resume_id IS NOT NULL
		`);

		console.log(`📋 Found ${interviews.length} interviews with selected resumes`);

		for (const interview of interviews) {
			console.log(`\n🔄 Regenerating PDF for: ${interview.meeting_title} (${interview.company})`);

			try {
				// Use the existing copyResumeToSchedule function to regenerate the PDF
				const filePath = await copyResumeToSchedule(interview.id, interview.selected_resume_id);
				console.log(`✅ PDF regenerated: ${filePath}`);
			} catch (error) {
				console.error(`❌ Failed to regenerate PDF for ${interview.meeting_title}:`, error.message);
			}
		}

		console.log("\n🎉 PDF regeneration process completed!");
		console.log("📁 Check your downloads now - PDFs should show proper resume content instead of blank pages.");

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to regenerate PDFs:");
		console.error("Error:", error.message);
	}
}

// Run the function
regenerateInterviewPDFs();
