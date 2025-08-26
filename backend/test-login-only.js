const axios = require("axios");

async function testLogin() {
	try {
		console.log("🚀 Testing login...");

		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", {
			email: "test@example.com",
			password: "password123",
		});

		console.log("✅ Login response:", loginResponse.data);

		const token = loginResponse.data.access_token;
		console.log("Token length:", token ? token.length : "No token");
		console.log("Token preview:", token ? `${token.substring(0, 20)}...` : "No token");
	} catch (error) {
		console.error("❌ Login error:");
		console.error("Error type:", typeof error);
		console.error("Error message:", error.message);
		if (error.response) {
			console.error("Status:", error.response.status);
			console.error("Data:", error.response.data);
		}
	}
}

testLogin();
