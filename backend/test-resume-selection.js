const axios = require("axios");

async function testResumeSelection() {
	console.log("🚀 Testing resume selection functionality...");
	try {
		// First, login to get a token
		console.log("📝 Attempting to login...");
		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", {
			email: "test@example.com",
			password: "password123",
		});

		const token = loginResponse.data.token;
		console.log("✅ Login successful, token obtained");

		// Get saved resumes
		console.log("📋 Fetching saved resumes...");
		const resumesResponse = await axios.get("http://localhost:4000/api/saved-resumes", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (resumesResponse.data.success) {
			const resumes = resumesResponse.data.savedResumes;
			console.log(`✅ Found ${resumes.length} saved resumes`);

			if (resumes.length > 0) {
				const firstResume = resumes[0];
				console.log("📄 First resume details:");
				console.log("  ID:", firstResume.id);
				console.log("  Company:", firstResume.company || "N/A");
				console.log("  Job Description Length:", firstResume.jobDescription?.length || 0);
				console.log("  Job Description Preview:", `${firstResume.jobDescription?.substring(0, 100)}...`);

				if (firstResume.jobDescription) {
					console.log("✅ Resume has job description - auto-population will work!");
				} else {
					console.log("⚠️  Resume doesn't have job description - auto-population won't work");
				}
			} else {
				console.log("ℹ️  No saved resumes found. You'll need to upload some resumes first.");
			}
		} else {
			console.log("❌ Failed to fetch resumes");
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

testResumeSelection();
