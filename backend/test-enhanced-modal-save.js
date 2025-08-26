const axios = require("axios");

async function testEnhancedModalSave() {
	try {
		console.log("Testing Enhanced Modal Save Functionality...");

		// First, let's login to get a token
		const loginData = {
			email: "test@example.com",
			password: "password123",
		};

		console.log("Attempting to login...");
		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", loginData);
		console.log("✅ Login successful");

		const token = loginResponse.data.token;
		const userId = loginResponse.data.user.id;

		// Set up axios with auth header
		const authAxios = axios.create({
			baseURL: "http://localhost:4000",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		// Test saving an optimized resume (simulating what the enhanced modal would do)
		console.log("\nTesting save optimized resume...");
		const optimizedResumeData = {
			user: userId,
			profile: "6fe1b1c0-8c61-45b8-afe3-cffa60816b16",
			originalResume: "Original resume content for enhanced modal test",
			modifiedResume: "Optimized resume content for enhanced modal test - tailored for Frontend Developer position",
			jobDescription: "Frontend Developer position requiring React, TypeScript, and modern web development skills",
			company: "Tech Company",
			jobLink: "https://example.com/job/enhanced-modal-test",
		};

		try {
			const saveResponse = await authAxios.post("/api/saved-resumes", optimizedResumeData);
			console.log("✅ Enhanced modal save response:", saveResponse.data);

			// Check if files were created
			console.log("\nChecking if files were created...");
			const listResponse = await authAxios.get("/api/saved-resumes");
			const savedResumes = listResponse.data.savedResumes;
			const latestResume = savedResumes[0];

			if (latestResume) {
				console.log("✅ Latest saved resume found:", latestResume.id);
				console.log("Original resume path:", latestResume.original_resume);
				console.log("Modified resume path:", latestResume.modified_resume);

				// Test retrieving the optimized resume file
				console.log("\nTesting optimized resume file retrieval...");
				const encodedPath = encodeURIComponent(latestResume.modified_resume);
				const fileResponse = await authAxios.get(`/api/resume-files/${encodedPath}`);

				console.log("✅ Optimized resume file content retrieved:");
				console.log("Content length:", fileResponse.data.content.length);
				console.log("First 100 characters:", fileResponse.data.content.substring(0, 100));
			}
		} catch (error) {
			console.log("❌ Enhanced modal save failed:", error.response?.data || error.message);
		}
	} catch (error) {
		console.error("❌ Test failed:", error.response?.data || error.message);
	}
}

testEnhancedModalSave();
