require("dotenv").config();
const { query } = require("./db");

async function createTestInterviews() {
	try {
		console.log("Creating test interviews for test user...");

		const userId = "c80df512-7580-11f0-ae84-5254006a331e";

		const interviews = [
			{
				meeting_title: "System Design Interview",
				meeting_date: "2025-01-21 14:00:00",
				interviewer: "Jane Smith",
				progress: 0,
				job_description: "Full Stack Engineer",
				meeting_link: "https://meet.google.com/test-1",
			},
			{
				meeting_title: "Technical Interview",
				meeting_date: "2025-01-20 15:00:00",
				interviewer: "John Doe",
				progress: 0,
				job_description: "Senior React Developer",
				meeting_link: "https://meet.google.com/test-2",
			},
			{
				meeting_title: "HR Interview",
				meeting_date: "2025-01-18 10:00:00",
				interviewer: "Mike Johnson",
				progress: 1,
				job_description: "Frontend Developer",
				meeting_link: "https://meet.google.com/test-3",
			},
		];

		for (const interview of interviews) {
			await query(
				`INSERT INTO interviews (
					id, user, meeting_title, meeting_date, interviewer, 
					progress, job_description, meeting_link, created_at, updated_at
				) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
				[userId, interview.meeting_title, interview.meeting_date, interview.interviewer, interview.progress, interview.job_description, interview.meeting_link],
			);
		}

		console.log("✅ Test interviews created for test user!");
	} catch (error) {
		console.error("❌ Failed to create test interviews:");
		console.error("Error:", error.message);
	}
}

createTestInterviews();
