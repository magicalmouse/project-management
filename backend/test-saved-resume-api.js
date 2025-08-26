const axios = require("axios");

async function testSavedResumeAPI() {
	try {
		console.log("Testing Saved Resume API...");

		// First, let's test the health endpoint
		const healthResponse = await axios.get("http://localhost:4000/api/health");
		console.log("✅ Health check passed:", healthResponse.data);

		// Test getting saved resumes list (this should work without auth for testing)
		try {
			const listResponse = await axios.get("http://localhost:4000/api/saved-resumes");
			console.log("✅ Get saved resumes list response:", listResponse.data);
		} catch (error) {
			console.log("❌ Get saved resumes list failed (expected if no auth):", error.response?.data || error.message);
		}

		// Test creating a saved resume (this should work without auth for testing)
		const testResumeData = {
			user: "test-user-id",
			profile: "test-profile-id",
			originalResume: "Original resume content",
			modifiedResume: "Modified resume content",
			jobDescription: "Test job description",
			company: "Test Company",
			jobLink: "https://example.com/job",
		};

		try {
			const createResponse = await axios.post("http://localhost:4000/api/saved-resumes", testResumeData);
			console.log("✅ Create saved resume response:", createResponse.data);
		} catch (error) {
			console.log("❌ Create saved resume failed (expected if no auth):", error.response?.data || error.message);
		}
	} catch (error) {
		console.error("❌ Test failed:", error.message);
	}
}

testSavedResumeAPI();
