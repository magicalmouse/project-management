const axios = require("axios");

async function testDashboard() {
	try {
		console.log("Testing login to get token...");

		// First login to get a token
		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", {
			email: "pookiemoney717@gmail.com",
			password: "test123",
		});

		if (!loginResponse.data.success) {
			console.error("❌ Login failed");
			return;
		}

		const token = loginResponse.data.token;
		console.log("✅ Login successful, got token");

		// Now test the dashboard endpoint
		console.log("\nTesting dashboard stats endpoint...");
		const dashboardResponse = await axios.get("http://localhost:4000/api/dashboard/stats", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		console.log("✅ Dashboard stats successful:");
		console.log(JSON.stringify(dashboardResponse.data, null, 2));
	} catch (error) {
		console.error("❌ Dashboard test failed:");
		console.error("Status:", error.response?.status);
		console.error("Error:", error.response?.data || error.message);

		if (error.response?.status === 500) {
			console.error("500 Internal Server Error - Check backend logs and database");
		} else if (error.response?.status === 401) {
			console.error("401 Unauthorized - Token issue");
		} else if (error.response?.status === 403) {
			console.error("403 Forbidden - Permission issue");
		}
	}
}

testDashboard();
