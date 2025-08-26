const axios = require("axios");

async function testForeignKeyFix() {
	console.log("🚀 Testing foreign key constraint fix...");
	try {
		// First, login to get a token
		console.log("📝 Attempting to login...");
		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", {
			email: "test@example.com",
			password: "password123",
		});

		const token = loginResponse.data.token;
		console.log("✅ Login successful, token obtained");

		// Get proposals to find one to update
		console.log("📋 Fetching proposals...");
		const proposalsResponse = await axios.get("http://localhost:4000/api/proposals", {
			headers: { Authorization: `Bearer ${token}` },
		});

		const proposals = proposalsResponse.data.proposals;
		console.log("✅ Found proposals:", proposals.length);

		if (proposals.length === 0) {
			console.log("❌ No proposals found to test with");
			return;
		}

		const proposalToUpdate = proposals[0];
		console.log("📝 Testing update with proposal:", proposalToUpdate.id);

		// Test update with empty profile (this was causing the foreign key error)
		const updateData = {
			profile: "", // Empty string that should be converted to NULL
			company: "Test Company with Empty Profile",
			jobDescription: "Test Job Description",
			jobLink: "https://test.com",
			coverLetter: "Test cover letter",
			status: "applied",
		};

		console.log("🔄 Sending update request with empty profile:", updateData);

		const updateResponse = await axios.put(`http://localhost:4000/api/proposals/${proposalToUpdate.id}`, updateData, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		console.log("✅ Update successful with empty profile!");
		console.log("Updated proposal:", updateResponse.data.proposal);
		console.log("Profile value:", updateResponse.data.proposal.profile); // Should be null
	} catch (error) {
		console.error("❌ Error occurred:");
		console.error("Error type:", typeof error);
		console.error("Error message:", error.message);

		if (error.response) {
			console.error("Status:", error.response.status);
			console.error("Status Text:", error.response.statusText);
			console.error("Response Data:", JSON.stringify(error.response.data, null, 2));
		} else if (error.request) {
			console.error("Request was made but no response received");
		} else {
			console.error("Error setting up request:", error.message);
		}

		console.error("Error stack:", error.stack);
	}
}

testForeignKeyFix();
