const axios = require("axios");

async function testInterviewCreation() {
	console.log("🚀 Testing interview creation functionality...");
	try {
		// First, login to get a token
		console.log("📝 Attempting to login...");
		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", {
			email: "test@example.com",
			password: "password123",
		});

		const token = loginResponse.data.token;
		console.log("✅ Login successful, token obtained");

		// Create a new interview
		console.log("📅 Creating new interview...");
		const interviewData = {
			meetingTitle: "Test Interview",
			meetingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
			meetingLink: "https://meet.google.com/test-interview",
			interviewer: "Test Interviewer",
			progress: 0, // 0 = PENDING, 1 = IN_PROGRESS, 2 = COMPLETED, etc.
			jobDescription: "Test job description for the interview",
			notes: "Test notes",
			feedback: "",
		};

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

testInterviewCreation();
