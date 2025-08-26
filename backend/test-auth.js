const axios = require("axios");

async function testAuth() {
	try {
		console.log("Testing user login...");

		// Test login
		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", {
			email: "pookiemoney717@gmail.com",
			password: "test123",
		});

		console.log("✅ Login successful:", loginResponse.data);

		// Test getting current user with token
		const token = loginResponse.data.token;
		console.log("\nTesting get current user...");

		const userResponse = await axios.get("http://localhost:4000/api/auth/me", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		console.log("✅ Get current user successful:", userResponse.data);

		// Test getting user profile
		console.log("\nTesting get user profile...");
		const profileResponse = await axios.get("http://localhost:4000/api/profiles", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		console.log("✅ Get profile successful:", profileResponse.data);
	} catch (error) {
		console.error("❌ Auth test failed:");
		console.error("Status:", error.response?.status);
		console.error("Error:", error.response?.data || error.message);

		if (error.response?.status === 500) {
			console.error("500 Internal Server Error - Check backend logs");
		}
	}
}

testAuth();
