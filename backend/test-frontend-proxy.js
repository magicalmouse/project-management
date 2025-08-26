const axios = require("axios");

async function testFrontendProxy() {
	console.log("🚀 Testing frontend proxy update...");
	try {
		// First, login to get a token through the frontend proxy
		console.log("📝 Attempting to login through frontend proxy...");
		const loginResponse = await axios.post("http://localhost:3001/api/auth/login", {
			email: "test@example.com",
			password: "password123",
		});

		const token = loginResponse.data.token;
		console.log("✅ Login successful, token obtained");
		console.log("Token:", `${token.substring(0, 20)}...`);

		// Get proposals through the frontend proxy
		console.log("📋 Fetching proposals through frontend proxy...");
		const proposalsResponse = await axios.get("http://localhost:3001/api/proposals", {
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
		console.log("Current proposal data:", JSON.stringify(proposalToUpdate, null, 2));

		// Test update with minimal data (exactly like the frontend form)
		const updateData = {
			company: "Frontend Test Company",
			jobDescription: "Frontend Test Job",
			jobLink: "https://frontend-test.com",
			coverLetter: "This is a test cover letter from frontend",
			status: "applied",
		};

		console.log("🔄 Sending update request through frontend proxy with data:", updateData);

		const updateResponse = await axios.put(`http://localhost:3001/api/proposals/${proposalToUpdate.id}`, updateData, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		console.log("✅ Update successful:", updateResponse.data);
	} catch (error) {
		console.error("❌ Error occurred:");
		console.error("Error type:", typeof error);
		console.error("Error message:", error.message);

		if (error.response) {
			console.error("Status:", error.response.status);
			console.error("Status Text:", error.response.statusText);
			console.error("Response Data:", JSON.stringify(error.response.data, null, 2));
			console.error("Response Headers:", error.response.headers);
		} else if (error.request) {
			console.error("Request was made but no response received");
			console.error("Request:", error.request);
		} else {
			console.error("Error setting up request:", error.message);
		}

		console.error("Error stack:", error.stack);
	}
}

testFrontendProxy();
