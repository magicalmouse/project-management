// Test data seeding script for admin dashboard analytics
import { executeQuery } from "../api/database/mysqlClient";
import { InterviewRepository, ProposalRepository, UserRepository } from "../api/database/repository";
import { InterviewProgress } from "../types/enum";

export const seedTestData = async () => {
	try {
		console.log("🗄️ Starting database test data seeding...");

		// Always try database operations - this will fail gracefully if no database

		// Create test users (if they don't exist)
		const testUsers = [
			{
				email: "testuser1@example.com",
				username: "testuser1",
				password_hash: "hashedpassword",
				role: 1,
				status: 1,
			},
			{
				email: "testuser2@example.com",
				username: "testuser2",
				password_hash: "hashedpassword",
				role: 1,
				status: 1,
			},
			{
				email: "testuser3@example.com",
				username: "testuser3",
				password_hash: "hashedpassword",
				role: 1,
				status: 1,
			},
		];

		const userIds: string[] = [];
		for (const user of testUsers) {
			try {
				const existingUser = await executeQuery("SELECT id FROM users WHERE email = ?", [user.email]);
				if (existingUser.length === 0) {
					const userId = await UserRepository.create(user as any);
					userIds.push(userId);
					console.log(`Created user: ${user.email}`);
				} else {
					userIds.push((existingUser as any)[0].id);
					console.log(`User already exists: ${user.email}`);
				}
			} catch (error) {
				console.error(`Error creating user ${user.email}:`, error);
			}
		}

		// Create test proposals
		const testProposals = [
			{
				profile: "1",
				user: userIds[0] || "1",
				job_description: "Senior React Developer",
				company: "TechCorp Inc",
				job_link: "https://techcorp.com/jobs/react-dev",
				cover_letter: "I am excited to apply for this position...",
			},
			{
				profile: "1",
				user: userIds[1] || "2",
				job_description: "Full Stack Engineer",
				company: "StartupXYZ",
				job_link: "https://startupxyz.com/careers",
				cover_letter: "With my experience in full stack development...",
			},
			{
				profile: "1",
				user: userIds[0] || "1",
				job_description: "Frontend Developer",
				company: "BigTech Corp",
				job_link: "https://bigtech.com/openings",
				cover_letter: "I would love to join your frontend team...",
			},
			{
				profile: "1",
				user: userIds[2] || "3",
				job_description: "DevOps Engineer",
				company: "CloudCorp",
				job_link: "https://cloudcorp.com/jobs",
				cover_letter: "My experience with cloud infrastructure...",
			},
			{
				profile: "1",
				user: userIds[1] || "2",
				job_description: "Backend Developer",
				company: "TechCorp Inc",
				job_link: "https://techcorp.com/jobs/backend",
				cover_letter: "I have strong backend development skills...",
			},
		];

		const proposalIds: string[] = [];
		for (const proposal of testProposals) {
			try {
				const proposalId = await ProposalRepository.upsert(proposal as any);
				proposalIds.push(proposalId);
				console.log(`Created proposal: ${proposal.job_description} at ${proposal.company}`);
			} catch (error) {
				console.error("Error creating proposal:", error);
			}
		}

		// Create test interviews
		const testInterviews = [
			{
				proposal: proposalIds[0] || "1",
				user: userIds[0] || "1",
				profile: "1",
				meeting_title: "Technical Interview - React Position",
				meeting_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
				meeting_link: "https://meet.google.com/abc-def-ghi",
				interviewer: "John Smith",
				progress: InterviewProgress.PENDING,
				job_description: "Senior React Developer",
			},
			{
				proposal: proposalIds[1] || "2",
				user: userIds[1] || "2",
				profile: "1",
				meeting_title: "System Design Interview",
				meeting_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
				meeting_link: "https://meet.google.com/xyz-abc-def",
				interviewer: "Jane Doe",
				progress: InterviewProgress.SUCCESS,
				job_description: "Full Stack Engineer",
			},
			{
				proposal: proposalIds[2] || "3",
				user: userIds[0] || "1",
				profile: "1",
				meeting_title: "HR Interview - Frontend Role",
				meeting_date: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
				meeting_link: "https://meet.google.com/def-ghi-jkl",
				interviewer: "Mike Johnson",
				progress: InterviewProgress.FAIL,
				job_description: "Frontend Developer",
			},
		];

		for (const interview of testInterviews) {
			try {
				const interviewId = await InterviewRepository.upsert(interview as any);
				console.log(`Created interview: ${interview.meeting_title}`);
			} catch (error) {
				console.error("Error creating interview:", error);
			}
		}

		console.log("✅ Test data seeding completed successfully!");
		console.log("📊 Admin dashboard should now show real database analytics");
	} catch (error) {
		console.error("❌ Error seeding test data:", error);
	}
};

// Function to clear test data from database
export const clearTestData = async () => {
	try {
		console.log("🗑️ Clearing test data from database...");

		// Clear test data from database tables
		await executeQuery("DELETE FROM interviews WHERE user IN (SELECT id FROM users WHERE email LIKE '%@example.com')");
		await executeQuery("DELETE FROM proposals WHERE user IN (SELECT id FROM users WHERE email LIKE '%@example.com')");
		await executeQuery("DELETE FROM users WHERE email LIKE '%@example.com'");

		console.log("✅ Test data cleared from database successfully!");
	} catch (error) {
		console.error("❌ Error clearing test data:", error);
		throw error;
	}
};

// Export for use in other files
export default seedTestData;
