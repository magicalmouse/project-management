require("dotenv").config();
const { query } = require("./db");

// Generate UUID function
const generateUUID = () => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

async function createTestProposals() {
	try {
		console.log("Creating test proposals for test user...");

		// Get test user
		const users = await query("SELECT id, email, username FROM users WHERE email = ?", ["test@example.com"]);
		if (users.length === 0) {
			console.error("❌ Test user not found");
			return;
		}

		const user = users[0];
		console.log("✅ Test user found:", user);

		// Get user's profile
		const profiles = await query("SELECT id FROM profiles WHERE user = ?", [user.id]);
		let profileId = null;

		if (profiles.length > 0) {
			profileId = profiles[0].id;
			console.log("✅ User profile found:", profileId);
		} else {
			console.log("⚠️ No profile found for user, creating one...");
			profileId = generateUUID();
			await query(
				`INSERT INTO profiles (
					id, first_name, last_name, name, email, phone, country, 
					summary, job_title, experience_level, location, skills, user
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					profileId,
					"John",
					"Doe",
					"John Doe",
					user.email,
					"+1234567890",
					"USA",
					"Experienced software developer with 5+ years in web development",
					"Senior Developer",
					"Mid-level",
					"New York, NY",
					"JavaScript, React, Node.js, Python, SQL",
					user.id,
				],
			);
			console.log("✅ Profile created:", profileId);
		}

		// Create test proposals
		const proposals = [
			{
				id: generateUUID(),
				job_description: "Senior React Developer position at TechCorp",
				company: "TechCorp",
				job_link: "https://techcorp.com/careers/react-developer",
				cover_letter: "I am excited to apply for the Senior React Developer position...",
				status: "applied",
			},
			{
				id: generateUUID(),
				job_description: "Full Stack Engineer at StartupXYZ",
				company: "StartupXYZ",
				job_link: "https://startupxyz.com/jobs/fullstack",
				cover_letter: "With my experience in both frontend and backend development...",
				status: "interviewing",
			},
			{
				id: generateUUID(),
				job_description: "Frontend Developer at DigitalAgency",
				company: "DigitalAgency",
				job_link: "https://digitalagency.com/careers/frontend",
				cover_letter: "I am passionate about creating beautiful and functional user interfaces...",
				status: "applied",
			},
		];

		for (const proposal of proposals) {
			await query(
				`INSERT INTO proposals (
					id, user, profile, job_description, company, job_link, 
					cover_letter, status, applied_date
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
				[proposal.id, user.id, profileId, proposal.job_description, proposal.company, proposal.job_link, proposal.cover_letter, proposal.status],
			);
		}
		console.log("✅ Test proposals created!");

		// Verify proposals were created
		const userProposals = await query("SELECT id, company, status FROM proposals WHERE user = ?", [user.id]);
		console.log("✅ User proposals:", userProposals.length);
	} catch (error) {
		console.error("❌ Failed to create test proposals:");
		console.error("Error:", error.message);
	}
}

createTestProposals();
