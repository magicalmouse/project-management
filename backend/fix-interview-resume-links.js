const { query } = require("./db");

async function fixInterviewResumeLinks() {
	try {
		console.log("🔧 Fixing interview resume links...\n");

		// Get all interviews that have resume_link with the old format
		const interviews = await query("SELECT id, resume_link FROM interviews WHERE resume_link LIKE '%/scheduled-resume'");

		console.log(`📊 Found ${interviews.length} interviews with old resume links`);

		if (interviews.length === 0) {
			console.log("✅ No interviews need fixing");
			return;
		}

		// Update each interview
		for (const interview of interviews) {
			const newResumeLink = interview.resume_link.replace("/scheduled-resume", "/scheduled-resume-pdf");

			await query("UPDATE interviews SET resume_link = ? WHERE id = ?", [newResumeLink, interview.id]);

			console.log(`✅ Updated interview ${interview.id}:`);
			console.log(`   Old: ${interview.resume_link}`);
			console.log(`   New: ${newResumeLink}`);
		}

		console.log("\n🎉 All interview resume links have been fixed!");
	} catch (error) {
		console.error("❌ Error fixing resume links:", error);
	}
}

fixInterviewResumeLinks();
