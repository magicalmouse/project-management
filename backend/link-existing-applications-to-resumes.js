require("dotenv").config();
const mysql = require("mysql2/promise");

async function linkApplicationsToResumes() {
	try {
		console.log("🔗 Linking existing job applications to saved resumes...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
		});

		console.log("✅ Connected to database!");

		// Find job applications that don't have a saved_resume_id
		const [unlinkedProposals] = await connection.execute(`
			SELECT id, user, company, job_description, created_at
			FROM proposals 
			WHERE saved_resume_id IS NULL 
			  AND company IS NOT NULL 
			  AND job_description IS NOT NULL
			ORDER BY created_at DESC
		`);

		console.log(`📋 Found ${unlinkedProposals.length} unlinked job applications`);

		let linkedCount = 0;

		for (const proposal of unlinkedProposals) {
			// Try to find a matching saved resume for this proposal
			// First try exact company match
			let [matchingResumes] = await connection.execute(
				`
				SELECT id, company, job_description, created_at
				FROM saved_resumes 
				WHERE user = ? 
				  AND company = ?
				  AND job_description IS NOT NULL
				ORDER BY created_at DESC
				LIMIT 5
			`,
				[proposal.user, proposal.company],
			);

			// If no exact match, try partial company name matching
			if (matchingResumes.length === 0) {
				[matchingResumes] = await connection.execute(
					`
					SELECT id, company, job_description, created_at
					FROM saved_resumes 
					WHERE user = ? 
					  AND (company LIKE ? OR ? LIKE CONCAT('%', company, '%'))
					  AND job_description IS NOT NULL
					ORDER BY created_at DESC
					LIMIT 5
				`,
					[proposal.user, `%${proposal.company}%`, proposal.company],
				);
			}

			if (matchingResumes.length > 0) {
				// Use the most recent matching resume
				const bestMatch = matchingResumes[0];

				// Update the proposal to link it to this resume
				await connection.execute("UPDATE proposals SET saved_resume_id = ? WHERE id = ?", [bestMatch.id, proposal.id]);

				console.log(`✅ Linked application "${proposal.company}" to resume "${bestMatch.company}" (${bestMatch.id.substring(0, 8)}...)`);
				linkedCount++;
			} else {
				console.log(`❌ No matching resume found for application: ${proposal.company}`);
			}
		}

		console.log(`\n🎉 Successfully linked ${linkedCount} job applications to saved resumes!`);
		console.log("📊 Summary:");
		console.log(`   • Total unlinked applications found: ${unlinkedProposals.length}`);
		console.log(`   • Applications successfully linked: ${linkedCount}`);
		console.log(`   • Applications still unlinked: ${unlinkedProposals.length - linkedCount}`);

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to link applications to resumes:");
		console.error("Error:", error.message);
	}
}

// Run the function
linkApplicationsToResumes();
