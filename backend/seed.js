const { query } = require("./db");

async function seedTestData() {
	// Create users
	const users = [
		{ email: "testuser1@example.com", username: "testuser1", password_hash: "hashed", role: 1, status: 1 },
		{ email: "testuser2@example.com", username: "testuser2", password_hash: "hashed", role: 1, status: 1 },
		{ email: "admin@example.com", username: "admin", password_hash: "hashed", role: 0, status: 1 },
	];
	for (const user of users) {
		await query("INSERT IGNORE INTO users (email, username, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())", [
			user.email,
			user.username,
			user.password_hash,
			user.role,
			user.status,
		]);
	}
	// Get user IDs
	const userRows = await query("SELECT id, email FROM users WHERE email LIKE '%@example.com'");
	const userIds = userRows.map((u) => u.id);

	// Proposals
	const proposals = [
		{
			user: userIds[0],
			job_description: "Senior React Developer",
			company: "TechCorp Inc",
			job_link: "https://techcorp.com/jobs/react-dev",
			cover_letter: "I am excited to apply...",
			created_at: new Date(),
		},
		{
			user: userIds[1],
			job_description: "Full Stack Engineer",
			company: "StartupXYZ",
			job_link: "https://startupxyz.com/careers",
			cover_letter: "With my experience...",
			created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
		},
		{
			user: userIds[0],
			job_description: "Frontend Developer",
			company: "BigTech Corp",
			job_link: "https://bigtech.com/openings",
			cover_letter: "I would love to join...",
			created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
		},
		{
			user: userIds[2],
			job_description: "DevOps Engineer",
			company: "CloudCorp",
			job_link: "https://cloudcorp.com/jobs",
			cover_letter: "My experience...",
			created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
		},
		{
			user: userIds[1],
			job_description: "Backend Developer",
			company: "TechCorp Inc",
			job_link: "https://techcorp.com/jobs/backend",
			cover_letter: "I have strong backend...",
			created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
		},
	];
	for (const p of proposals) {
		await query("INSERT INTO proposals (user, job_description, company, job_link, cover_letter, created_at) VALUES (?, ?, ?, ?, ?, ?)", [
			p.user,
			p.job_description,
			p.company,
			p.job_link,
			p.cover_letter,
			p.created_at,
		]);
	}

	// Get proposal IDs
	const proposalRows = await query("SELECT id FROM proposals WHERE user IN (?)", [userIds]);
	const proposalIds = proposalRows.map((p) => p.id);

	// Interviews
	const interviews = [
		{
			proposal: proposalIds[0],
			user: userIds[0],
			meeting_title: "Technical Interview",
			meeting_date: new Date(Date.now() + 86400000),
			interviewer: "John Smith",
			progress: "PENDING",
			job_description: "Senior React Developer",
			created_at: new Date(),
		},
		{
			proposal: proposalIds[1],
			user: userIds[1],
			meeting_title: "System Design Interview",
			meeting_date: new Date(Date.now() - 86400000),
			interviewer: "Jane Doe",
			progress: "SUCCESS",
			job_description: "Full Stack Engineer",
			created_at: new Date(Date.now() - 86400000),
		},
		{
			proposal: proposalIds[2],
			user: userIds[0],
			meeting_title: "HR Interview",
			meeting_date: new Date(Date.now() - 2 * 86400000),
			interviewer: "Mike Johnson",
			progress: "FAIL",
			job_description: "Frontend Developer",
			created_at: new Date(Date.now() - 2 * 86400000),
		},
	];
	for (const i of interviews) {
		await query(
			"INSERT INTO interviews (proposal, user, meeting_title, meeting_date, interviewer, progress, job_description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			[i.proposal, i.user, i.meeting_title, i.meeting_date, i.interviewer, i.progress, i.job_description, i.created_at],
		);
	}
}

async function clearTestData() {
	await query("DELETE FROM interviews WHERE user IN (SELECT id FROM users WHERE email LIKE '%@example.com')");
	await query("DELETE FROM proposals WHERE user IN (SELECT id FROM users WHERE email LIKE '%@example.com')");
	await query("DELETE FROM users WHERE email LIKE '%@example.com'");
}

module.exports = { seedTestData, clearTestData };
