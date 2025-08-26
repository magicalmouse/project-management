require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("node:fs");
const path = require("node:path");

async function testPDFContent() {
	try {
		console.log("🧪 Testing PDF content to verify original files are being used...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
		});

		console.log("✅ Connected to database!");

		// Get interview data
		const [interviews] = await connection.execute(`
			SELECT i.id, i.meeting_title, sr.company, p.resume_pdf_path
			FROM interviews i
			JOIN saved_resumes sr ON i.selected_resume_id = sr.id
			LEFT JOIN proposals p ON p.saved_resume_id = sr.id
			WHERE i.meeting_title LIKE '%Phone%'
		`);

		if (interviews.length > 0) {
			const interview = interviews[0];
			console.log(`\n📋 Interview: ${interview.meeting_title} (${interview.company})`);

			// Original PDF path
			const originalPdfPath = path.join(__dirname, interview.resume_pdf_path);
			console.log(`📁 Original PDF: ${originalPdfPath}`);

			if (fs.existsSync(originalPdfPath)) {
				const originalStats = fs.statSync(originalPdfPath);
				console.log(`📊 Original PDF size: ${originalStats.size} bytes`);
				console.log(`🕒 Original PDF modified: ${originalStats.mtime}`);
			}

			// Schedule PDF directory
			const scheduleDir = path.join(__dirname, "uploads/schedule/resumes");
			const scheduleFiles = fs
				.readdirSync(scheduleDir)
				.filter((f) => f.includes("Phoenix"))
				.sort()
				.reverse(); // Get latest first

			console.log(`\n📁 Schedule PDFs found: ${scheduleFiles.length}`);

			scheduleFiles.forEach((file, index) => {
				const filePath = path.join(scheduleDir, file);
				const stats = fs.statSync(filePath);
				console.log(`📄 ${index + 1}. ${file}`);
				console.log(`   Size: ${stats.size} bytes`);
				console.log(`   Modified: ${stats.mtime}`);
			});

			// Check if latest schedule PDF matches original
			if (scheduleFiles.length > 0) {
				const latestFile = scheduleFiles[0];
				const latestPath = path.join(scheduleDir, latestFile);
				const latestStats = fs.statSync(latestPath);
				const originalStats = fs.statSync(originalPdfPath);

				console.log("\n🔍 Comparison:");
				console.log(`Original: ${originalStats.size} bytes`);
				console.log(`Latest Schedule: ${latestStats.size} bytes`);
				console.log(`Sizes match: ${originalStats.size === latestStats.size ? "✅ YES" : "❌ NO"}`);

				// Compare file contents
				const originalContent = fs.readFileSync(originalPdfPath);
				const scheduleContent = fs.readFileSync(latestPath);
				const contentsMatch = originalContent.equals(scheduleContent);
				console.log(`Contents match: ${contentsMatch ? "✅ YES" : "❌ NO"}`);

				if (contentsMatch) {
					console.log("\n🎉 SUCCESS: The schedule PDF is identical to your original upload!");
					console.log(`📥 Download this file to verify: ${latestFile}`);
				} else {
					console.log("\n⚠️ WARNING: The schedule PDF differs from your original upload!");
				}
			}
		}

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to test PDF content:");
		console.error("Error:", error.message);
	}
}

// Run the function
testPDFContent();
