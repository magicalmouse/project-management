require("dotenv").config();
const mysql = require("mysql2/promise");

async function testSavedResumes() {
	try {
		console.log("Testing saved resumes functionality...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
		});

		console.log("✅ Connected to database!");

		// Check if saved_resumes table exists
		const [tables] = await connection.execute("SHOW TABLES LIKE 'saved_resumes'");
		if (tables.length === 0) {
			console.log("❌ saved_resumes table does not exist. Please run the schema creation first.");
			return;
		}

		console.log("✅ saved_resumes table exists!");

		// Get a sample user and profile for testing
		const [users] = await connection.execute("SELECT id FROM users LIMIT 1");
		const [profiles] = await connection.execute("SELECT id FROM profiles LIMIT 1");

		if (users.length === 0 || profiles.length === 0) {
			console.log("❌ No users or profiles found. Please create test data first.");
			return;
		}

		const userId = users[0].id;
		const profileId = profiles[0].id;

		console.log(`Using user ID: ${userId}`);
		console.log(`Using profile ID: ${profileId}`);

		// Test creating a saved resume
		const testResume = {
			user: userId,
			profile: profileId,
			original_resume: "Original resume content for testing",
			modified_resume: "Modified resume content tailored for specific job",
			job_description: "Software Engineer position at Tech Company",
			company: "Tech Company Inc.",
			job_link: "https://example.com/job-posting",
		};

		const insertQuery = `
			INSERT INTO saved_resumes (user, profile, original_resume, modified_resume, job_description, company, job_link, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
		`;

		const [insertResult] = await connection.execute(insertQuery, [
			testResume.user,
			testResume.profile,
			testResume.original_resume,
			testResume.modified_resume,
			testResume.job_description,
			testResume.company,
			testResume.job_link,
		]);

		console.log(`✅ Created saved resume with ID: ${insertResult.insertId}`);

		// Test retrieving saved resumes
		const [resumes] = await connection.execute(
			`
			SELECT * FROM saved_resumes WHERE user = ? AND profile = ?
		`,
			[userId, profileId],
		);

		console.log(`✅ Found ${resumes.length} saved resumes for user`);

		if (resumes.length > 0) {
			const resume = resumes[0];
			console.log("Sample saved resume:");
			console.log(`- ID: ${resume.id}`);
			console.log(`- Company: ${resume.company}`);
			console.log(`- Job Description: ${resume.job_description.substring(0, 50)}...`);
			console.log(`- Created: ${resume.created_at}`);
		}

		// Test updating a saved resume
		if (resumes.length > 0) {
			const resumeId = resumes[0].id;
			const updateQuery = `
				UPDATE saved_resumes 
				SET modified_resume = ?, updated_at = NOW()
				WHERE id = ?
			`;

			await connection.execute(updateQuery, ["Updated modified resume content", resumeId]);

			console.log(`✅ Updated saved resume with ID: ${resumeId}`);
		}

		// Test deleting a saved resume
		if (resumes.length > 0) {
			const resumeId = resumes[0].id;
			await connection.execute("DELETE FROM saved_resumes WHERE id = ?", [resumeId]);
			console.log(`✅ Deleted saved resume with ID: ${resumeId}`);
		}

		await connection.end();
		console.log("✅ Saved resumes functionality test completed successfully!");
	} catch (error) {
		console.error("❌ Test failed:");
		console.error("Error:", error.message);
	}
}

testSavedResumes();
