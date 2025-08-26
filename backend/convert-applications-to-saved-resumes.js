require("dotenv").config();
const mysql = require("mysql2/promise");

async function convertApplicationsToSavedResumes() {
	try {
		console.log("🔄 Converting job applications to saved resumes...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
		});

		console.log("✅ Connected to database!");

		// Find job applications that don't have a saved_resume_id but have resume content
		const [unlinkedProposals] = await connection.execute(`
			SELECT id, user, company, job_description, resume, job_link, created_at
			FROM proposals 
			WHERE saved_resume_id IS NULL 
			  AND company IS NOT NULL 
			  AND job_description IS NOT NULL
			  AND resume IS NOT NULL
			ORDER BY created_at DESC
		`);

		console.log(`📋 Found ${unlinkedProposals.length} job applications without saved resumes`);

		let convertedCount = 0;

		for (const proposal of unlinkedProposals) {
			console.log(`\n🔄 Processing: ${proposal.company}`);

			// Check if a saved resume already exists with similar company/job description
			const [existingResumes] = await connection.execute(
				`
				SELECT id FROM saved_resumes 
				WHERE user = ? 
				  AND company = ?
				LIMIT 1
			`,
				[proposal.user, proposal.company],
			);

			if (existingResumes.length > 0) {
				// Link to existing resume
				const existingResumeId = existingResumes[0].id;
				await connection.execute("UPDATE proposals SET saved_resume_id = ? WHERE id = ?", [existingResumeId, proposal.id]);
				console.log(`✅ Linked to existing resume: ${existingResumeId.substring(0, 8)}...`);
			} else {
				// Get the user's profile ID
				const [userProfiles] = await connection.execute("SELECT id FROM profiles WHERE user = ? LIMIT 1", [proposal.user]);

				if (userProfiles.length === 0) {
					console.log(`❌ No profile found for user, skipping: ${proposal.company}`);
					continue;
				}

				const profileId = userProfiles[0].id;

				// Create a new saved resume from the job application
				const resumeId = require("node:crypto").randomUUID();

				await connection.execute(
					`
					INSERT INTO saved_resumes (
						id, user, profile, original_resume, modified_resume, 
						job_description, company, job_link, created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
				`,
					[
						resumeId,
						proposal.user,
						profileId, // Use the user's profile ID
						proposal.resume || "No original resume content", // original_resume
						proposal.resume || "Resume content from job application", // modified_resume
						proposal.job_description,
						proposal.company,
						proposal.job_link,
					],
				);

				// Link the proposal to the new saved resume
				await connection.execute("UPDATE proposals SET saved_resume_id = ? WHERE id = ?", [resumeId, proposal.id]);

				console.log(`✅ Created new saved resume and linked: ${resumeId.substring(0, 8)}...`);
			}

			convertedCount++;
		}

		console.log(`\n🎉 Successfully processed ${convertedCount} job applications!`);
		console.log("📊 Summary:");
		console.log(`   • Applications processed: ${unlinkedProposals.length}`);
		console.log("   • Now all applications should have linked resumes");

		// Verify the results
		console.log("\n🔍 Verification - Checking all job applications:");
		const [allProposals] = await connection.execute(`
			SELECT p.company, p.saved_resume_id, sr.company as resume_company
			FROM proposals p 
			LEFT JOIN saved_resumes sr ON p.saved_resume_id = sr.id 
			ORDER BY p.created_at DESC
		`);

		for (const p of allProposals) {
			const status = p.saved_resume_id ? "✅ LINKED" : "❌ NOT LINKED";
			console.log(`   ${p.company} → ${status} ${p.resume_company ? `(${p.resume_company})` : ""}`);
		}

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to convert applications to saved resumes:");
		console.error("Error:", error.message);
	}
}

// Run the function
convertApplicationsToSavedResumes();
