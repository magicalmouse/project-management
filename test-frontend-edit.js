const axios = require("axios");

async function testFrontendEdit() {
	try {
		console.log("🚀 Testing frontend edit request...");

		// Step 1: Login to get token
		const loginResponse = await axios.post("http://localhost:3001/api/auth/login", {
			email: "test@example.com",
			password: "password123",
		});

		console.log("✅ Login successful");
		const token = loginResponse.data.token;

		// Step 2: Get proposals
		const proposalsResponse = await axios.get("http://localhost:3001/api/proposals", {
			headers: { Authorization: `Bearer ${token}` },
		});

		console.log("✅ Got proposals:", proposalsResponse.data.proposals.length);

		// Step 3: Try to update a proposal (exactly like frontend does)
		const proposalToUpdate = proposalsResponse.data.proposals[0];

		const updateData = {
			company: "Test Company",
			jobDescription: "Test Job",
			jobLink: "https://test.com",
			coverLetter: "Test cover letter",
			status: "applied",
		};

		console.log("🔄 Updating proposal:", proposalToUpdate.id);
		console.log("Update data:", updateData);

		const updateResponse = await axios.put(`http://localhost:3001/api/proposals/${proposalToUpdate.id}`, updateData, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		console.log("✅ Update successful:", updateResponse.data);
	} catch (error) {
		console.error("❌ Error occurred:");
		console.error("Error message:", error.message);
		if (error.response) {
			console.error("Status:", error.response.status);
			console.error("Data:", error.response.data);
			console.error("Headers:", error.response.headers);
		}
	}
}

testFrontendEdit();
