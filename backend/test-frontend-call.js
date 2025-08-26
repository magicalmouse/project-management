const axios = require("axios");

async function testFrontendCall() {
	try {
		console.log("Testing complete frontend flow...");

		// 1. Login to get token
		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", {
			email: "pookiemoney717@gmail.com",
			password: "test123",
		});

		const token = loginResponse.data.token;
		console.log("✅ Login successful");

		// 2. Call dashboard exactly like frontend will (with correct URL and auto-auth)
		const dashboardResponse = await axios.get("http://localhost:4000/api/dashboard/stats", {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json;charset=utf-8",
			},
		});

		console.log("✅ Dashboard call successful");
		console.log("Dashboard data:", JSON.stringify(dashboardResponse.data, null, 2));
	} catch (error) {
		console.error("❌ Test failed:");
		console.error("Status:", error.response?.status);
		console.error("Error:", error.response?.data || error.message);
	}
}

testFrontendCall();
