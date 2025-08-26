require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("node:fs");
const path = require("node:path");
const pdf = require("pdf-parse");

async function extractPDFContent() {
	try {
		console.log("📄 Extracting content from uploaded PDF files...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
		});

		console.log("✅ Connected to database!");

		// Get all proposals with PDF files and their linked saved resumes
		const [proposals] = await connection.execute(`
			SELECT p.company, p.resume_pdf_path, p.saved_resume_id, sr.modified_resume
			FROM proposals p
			JOIN saved_resumes sr ON p.saved_resume_id = sr.id
			WHERE p.resume_pdf_path IS NOT NULL
		`);

		console.log(`📋 Found ${proposals.length} proposals with PDF files`);

		for (const proposal of proposals) {
			console.log(`\n🔄 Processing: ${proposal.company}`);

			const pdfPath = path.join(__dirname, proposal.resume_pdf_path);
			console.log(`📁 PDF Path: ${pdfPath}`);

			if (!fs.existsSync(pdfPath)) {
				console.log(`❌ PDF file not found: ${pdfPath}`);
				continue;
			}

			try {
				// Read and parse the PDF file
				const dataBuffer = fs.readFileSync(pdfPath);
				const pdfData = await pdf(dataBuffer);
				const extractedText = pdfData.text;

				console.log(`📄 Extracted ${extractedText.length} characters from PDF`);
				console.log(`📝 Preview: ${extractedText.substring(0, 100)}...`);

				// Update the saved resume with the extracted PDF content
				await connection.execute(
					`
					UPDATE saved_resumes 
					SET 
						original_resume = ?,
						modified_resume = ?
					WHERE id = ?
				`,
					[extractedText, extractedText, proposal.saved_resume_id],
				);

				console.log(`✅ Updated saved resume with PDF content for ${proposal.company}`);
			} catch (pdfError) {
				console.error(`❌ Failed to extract PDF content for ${proposal.company}:`, pdfError.message);
			}
		}

		console.log("\n🎉 PDF content extraction completed!");

		// Verify the updates
		console.log("\n🔍 Verification:");
		const [verification] = await connection.execute(`
			SELECT company, LENGTH(modified_resume) as content_length
			FROM saved_resumes 
			ORDER BY created_at DESC
		`);

		for (const v of verification) {
			console.log(`   ${v.company}: ${v.content_length} characters`);
		}

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to extract PDF content:");
		console.error("Error:", error.message);
	}
}

// Run the function
extractPDFContent();
