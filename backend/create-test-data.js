require("dotenv").config();
const bcrypt = require("bcryptjs");
const { query } = require("./db");

// Generate UUID function
const generateUUID = () => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

async function createTestData() {
	try {
		console.log("Creating test data...");

		// Create test user with UUID
		const userId = generateUUID();
		const hashedPassword = await bcrypt.hash("password123", 10);
		await query("INSERT INTO users (id, email, username, password_hash, role) VALUES (?, ?, ?, ?, ?)", [
			userId,
			"test@example.com",
			"testuser",
			hashedPassword,
			1,
		]);
		console.log("✅ Test user created with ID:", userId);

		// Create test profile with UUID
		const profileId = generateUUID();
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
				"test@example.com",
				"+1234567890",
				"USA",
				"Experienced software developer with 5+ years in web development",
				"Senior Developer",
				"Mid-level",
				"New York, NY",
				"JavaScript, React, Node.js, Python, SQL",
				userId,
			],
		);
		console.log("✅ Test profile created with ID:", profileId);

		// Create test proposals
		const proposals = [
			{
				id: generateUUID(),
				user: userId,
				profile: profileId,
				job_description: "Senior React Developer position at TechCorp",
				company: "TechCorp",
				job_link: "https://techcorp.com/careers/react-developer",
				cover_letter: "I am excited to apply for the Senior React Developer position...",
				status: "applied",
			},
			{
				id: generateUUID(),
				user: userId,
				profile: profileId,
				job_description: "Full Stack Engineer at StartupXYZ",
				company: "StartupXYZ",
				job_link: "https://startupxyz.com/jobs/fullstack",
				cover_letter: "With my experience in both frontend and backend development...",
				status: "interviewing",
			},
			{
				id: generateUUID(),
				user: userId,
				profile: profileId,
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
				[proposal.id, proposal.user, proposal.profile, proposal.job_description, proposal.company, proposal.job_link, proposal.cover_letter, proposal.status],
			);
		}
		console.log("✅ Test proposals created!");

		// Create admin user with UUID
		const adminId = generateUUID();
		const adminPassword = await bcrypt.hash("admin123", 10);
		await query("INSERT INTO users (id, email, username, password_hash, role) VALUES (?, ?, ?, ?, ?)", [
			adminId,
			"admin@example.com",
			"admin",
			adminPassword,
			0,
		]);
		console.log("✅ Admin user created!");

		console.log("✅ All test data created successfully!");
		console.log("\nTest credentials:");
		console.log("User: test@example.com / password123");
		console.log("Admin: admin@example.com / admin123");
	} catch (error) {
		console.error("❌ Failed to create test data:");
		console.error("Error:", error.message);
	}
}

createTestData();
