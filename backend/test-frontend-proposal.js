const axios = require("axios");

async function testFrontendProposal() {
	console.log("🚀 Testing frontend-like proposal creation...");
	try {
		// First, login to get a token
		console.log("📝 Attempting to login...");
		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", {
			email: "test@example.com",
			password: "password123",
		});

		const token = loginResponse.data.token;
		console.log("✅ Login successful, token obtained");

		// Test with empty data (like what frontend might send)
		console.log("📋 Testing with empty data...");
		const emptyData = {
			profile: "",
			jobDescription: "",
			company: "",
			jobLink: "",
			coverLetter: "",
			resume: "",
			status: "applied",
		};

		try {
			const emptyResponse = await axios.post("http://localhost:4000/api/proposals", emptyData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});
			console.log("❌ Empty data should have failed but didn't:", emptyResponse.data);
		} catch (error) {
			console.log("✅ Empty data correctly rejected:", error.response?.data);
		}

		// Test with minimal required data
		console.log("📋 Testing with minimal required data...");
		const minimalData = {
			profile: "",
			jobDescription: "Test job description",
			company: "Test Company",
			jobLink: "",
			coverLetter: "",
			resume: "",
			status: "applied",
		};

		const minimalResponse = await axios.post("http://localhost:4000/api/proposals", minimalData, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		console.log("✅ Minimal data created successfully!");
		console.log("Proposal ID:", minimalResponse.data.proposal.id);
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

testFrontendProposal();
