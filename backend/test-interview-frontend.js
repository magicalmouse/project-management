const axios = require("axios");

async function testInterviewFrontend() {
	console.log("🚀 Testing interview creation with frontend-like data...");
	try {
		// First, login to get a token
		console.log("📝 Attempting to login...");
		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", {
			email: "test@example.com",
			password: "password123",
		});

		const token = loginResponse.data.token;
		console.log("✅ Login successful, token obtained");

		// Get a saved resume to use for the test
		console.log("📋 Fetching saved resumes...");
		const resumesResponse = await axios.get("http://localhost:4000/api/saved-resumes", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		let selectedResumeId = null;
		if (resumesResponse.data.success && resumesResponse.data.savedResumes.length > 0) {
			selectedResumeId = resumesResponse.data.savedResumes[0].id;
			console.log("✅ Using resume ID:", selectedResumeId);
		}

		// Create a new interview with frontend-like data
		console.log("📅 Creating new interview with frontend data...");
		const interviewData = {
			meetingTitle: "Technical Interview",
			meetingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
			meetingLink: "https://meet.google.com/abc-defg-hij",
			interviewer: "John Smith",
			progress: 0, // PENDING from InterviewProgress enum
			jobDescription:
				"Remote - Puerto Rico, Argentina, Peru, Colombia, Dominica, Brazil, Chile, Guatemala, Honduras, Mexico APPLY NOW Outlier helps the most innovative companies in the world improve their AI models by providing human feedback. Are you an experienced software engineer who would like to lend your programming expertise to train AI models? Join our team",
			notes: "Test interview notes",
			feedback: "",
			selectedResumeId: selectedResumeId,
			resumeLink: selectedResumeId ? "/api/interviews/new-interview-id/scheduled-resume" : undefined,
		};

		console.log("📤 Sending interview data:", JSON.stringify(interviewData, null, 2));

		const createResponse = await axios.post("http://localhost:4000/api/interviews", interviewData, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (createResponse.data.success) {
			console.log("✅ Interview created successfully!");
			console.log("📄 Interview details:");
			console.log("  ID:", createResponse.data.interview.id);
			console.log("  Meeting Title:", createResponse.data.interview.meetingTitle);
			console.log("  Meeting Date:", createResponse.data.interview.meetingDate);
			console.log("  Interviewer:", createResponse.data.interview.interviewer);
			console.log("  Progress:", createResponse.data.interview.progress);
			console.log("  Selected Resume ID:", createResponse.data.interview.selectedResumeId);
			console.log("  Resume Link:", createResponse.data.interview.resumeLink);
		} else {
			console.log("❌ Failed to create interview");
			console.log("Response:", createResponse.data);
		}
	} catch (error) {
		console.error("❌ Error occurred:");
		if (error.response) {
			console.error("Status:", error.response.status);
			console.error("Data:", error.response.data);
		} else {
			console.error("Error:", error.message);
		}
	}
}

testInterviewFrontend();
