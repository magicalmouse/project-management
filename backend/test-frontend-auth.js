const axios = require("axios");

async function testFrontendAuth() {
	try {
		console.log("🚀 Testing frontend authentication flow...");

		// Step 1: Login (like frontend does)
		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", {
			email: "test@example.com",
			password: "password123",
		});

		console.log("✅ Login response:", {
			success: loginResponse.data.success,
			token: loginResponse.data.token ? `${loginResponse.data.token.substring(0, 20)}...` : "No token",
			refreshToken: loginResponse.data.refreshToken ? `${loginResponse.data.refreshToken.substring(0, 20)}...` : "No refresh token",
		});

		if (!loginResponse.data.token) {
			console.log("❌ No token received from login");
			return;
		}

		const token = loginResponse.data.token;

		// Step 2: Test getting proposals (like frontend does)
		console.log("🔄 Testing proposals endpoint with token...");
		const proposalsResponse = await axios.get("http://localhost:4000/api/proposals", {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		console.log("✅ Proposals response:", {
			success: proposalsResponse.data.success,
			count: proposalsResponse.data.proposals?.length || 0,
		});

		// Step 3: Test updating a proposal (like frontend does)
		if (proposalsResponse.data.proposals && proposalsResponse.data.proposals.length > 0) {
			const proposalToUpdate = proposalsResponse.data.proposals[0];
			console.log("🔄 Testing proposal update with token...");

			const updateData = {
				company: "Frontend Test Company",
				jobDescription: "Frontend Test Job",
				jobLink: "https://frontend-test.com",
				status: "applied",
			};

			const updateResponse = await axios.put(`http://localhost:4000/api/proposals/${proposalToUpdate.id}`, updateData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			console.log("✅ Update response:", {
				success: updateResponse.data.success,
				company: updateResponse.data.proposal?.company,
			});
		}
	} catch (error) {
		console.error("❌ Error occurred:");
		console.error("Error type:", typeof error);
		console.error("Error message:", error.message);
		if (error.response) {
			console.error("Status:", error.response.status);
			console.error("Data:", error.response.data);
		}
	}
}

testFrontendAuth();
