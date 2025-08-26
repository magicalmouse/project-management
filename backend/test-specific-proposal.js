const axios = require("axios");

async function testSpecificProposal() {
	console.log("🚀 Testing specific proposal that was causing 500 error...");
	try {
		// First, login to get a token
		console.log("📝 Attempting to login...");
		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", {
			email: "test@example.com",
			password: "password123",
		});

		const token = loginResponse.data.token;
		console.log("✅ Login successful, token obtained");

		// Get proposals to find one that belongs to the test user
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
		console.log("📝 Testing with proposal:", proposalToUpdate.id);

		// Test update with the exact data that was causing the error
		const updateData = {
			profile: "", // Empty string that should be converted to NULL
			jobDescription: "Senior React Developer",
			company: "TechCorp Inc",
			jobLink: "https://techcorp.com/jobs/react-dev",
			coverLetter: "fake site",
			resume: "", // Empty string
			status: "applied",
		};

		console.log("🔄 Sending update request with data:", updateData);

		const updateResponse = await axios.put(`http://localhost:4000/api/proposals/${proposalToUpdate.id}`, updateData, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		console.log("✅ Update successful for the problematic proposal!");
		console.log("Updated proposal:", updateResponse.data.proposal);
		console.log("Profile value:", updateResponse.data.proposal.profile); // Should be null
		console.log("Resume value:", updateResponse.data.proposal.resume); // Should be null
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

testSpecificProposal();
