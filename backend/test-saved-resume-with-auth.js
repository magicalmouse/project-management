const axios = require("axios");

async function testSavedResumeWithAuth() {
	try {
		console.log("Testing Saved Resume API with Authentication...");

		// First, let's login to get a token
		const loginData = {
			email: "test@example.com",
			password: "password123",
		};

		console.log("Attempting to login...");
		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", loginData);
		console.log("✅ Login successful:", loginResponse.data);

		const token = loginResponse.data.token;
		const userId = loginResponse.data.user.id;

		console.log("User ID:", userId);
		console.log("Token received:", token ? "Yes" : "No");

		// Set up axios with auth header
		const authAxios = axios.create({
			baseURL: "http://localhost:4000",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		// Test getting saved resumes list
		console.log("\nTesting get saved resumes list...");
		try {
			const listResponse = await authAxios.get("/api/saved-resumes");
			console.log("✅ Get saved resumes list response:", listResponse.data);
		} catch (error) {
			console.log("❌ Get saved resumes list failed:", error.response?.data || error.message);
		}

		// Test creating a saved resume
		console.log("\nTesting create saved resume...");
		const testResumeData = {
			user: userId,
			profile: "6fe1b1c0-8c61-45b8-afe3-cffa60816b16",
			originalResume: "Original resume content for testing",
			modifiedResume: "Modified resume content for testing",
			jobDescription: "Test job description for saved resume",
			company: "Test Company",
			jobLink: "https://example.com/job",
		};

		try {
			const createResponse = await authAxios.post("/api/saved-resumes", testResumeData);
			console.log("✅ Create saved resume response:", createResponse.data);

			// If creation was successful, test getting the specific resume
			if (createResponse.data.success && createResponse.data.savedResume.id) {
				const resumeId = createResponse.data.savedResume.id;
				console.log("\nTesting get saved resume by ID...");
				try {
					const getResponse = await authAxios.get(`/api/saved-resumes/${resumeId}`);
					console.log("✅ Get saved resume by ID response:", getResponse.data);
				} catch (error) {
					console.log("❌ Get saved resume by ID failed:", error.response?.data || error.message);
				}
			}
		} catch (error) {
			console.log("❌ Create saved resume failed:", error.response?.data || error.message);
		}
	} catch (error) {
		console.error("❌ Test failed:", error.response?.data || error.message);
	}
}

testSavedResumeWithAuth();
