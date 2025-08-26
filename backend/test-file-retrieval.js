const axios = require("axios");

async function testFileRetrieval() {
	try {
		console.log("Testing File Retrieval API...");

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

		// Get the latest saved resume to test file retrieval
		console.log("\nGetting saved resumes list...");
		const listResponse = await authAxios.get("/api/saved-resumes");
		const savedResumes = listResponse.data.savedResumes;

		if (savedResumes.length === 0) {
			console.log("❌ No saved resumes found to test file retrieval");
			return;
		}

		const latestResume = savedResumes[0];
		console.log("✅ Found saved resume:", latestResume.id);

		// Test retrieving the original resume file
		console.log("\nTesting original resume file retrieval...");
		try {
			const originalFilePath = latestResume.original_resume;
			const encodedPath = encodeURIComponent(originalFilePath);
			const fileResponse = await authAxios.get(`/api/resume-files/${encodedPath}`);

			console.log("✅ Original resume file content retrieved:");
			console.log("Content length:", fileResponse.data.content.length);
			console.log("First 100 characters:", fileResponse.data.content.substring(0, 100));
		} catch (error) {
			console.log("❌ Original resume file retrieval failed:", error.response?.data || error.message);
		}

		// Test retrieving the modified resume file
		console.log("\nTesting modified resume file retrieval...");
		try {
			const modifiedFilePath = latestResume.modified_resume;
			const encodedPath = encodeURIComponent(modifiedFilePath);
			const fileResponse = await authAxios.get(`/api/resume-files/${encodedPath}`);

			console.log("✅ Modified resume file content retrieved:");
			console.log("Content length:", fileResponse.data.content.length);
			console.log("First 100 characters:", fileResponse.data.content.substring(0, 100));
		} catch (error) {
			console.log("❌ Modified resume file retrieval failed:", error.response?.data || error.message);
		}

		// Test security - try to access a file outside uploads directory
		console.log("\nTesting security - accessing file outside uploads...");
		try {
			const maliciousPath = "../../../etc/passwd";
			const encodedPath = encodeURIComponent(maliciousPath);
			const fileResponse = await authAxios.get(`/api/resume-files/${encodedPath}`);
			console.log("❌ Security test failed - should have been blocked");
		} catch (error) {
			if (error.response?.status === 403) {
				console.log("✅ Security test passed - access denied for malicious path");
			} else {
				console.log("❌ Security test failed - unexpected error:", error.response?.data || error.message);
			}
		}
	} catch (error) {
		console.error("❌ Test failed:", error.response?.data || error.message);
	}
}

testFileRetrieval();
