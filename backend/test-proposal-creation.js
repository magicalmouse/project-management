const axios = require("axios");

async function testProposalCreation() {
	console.log("🚀 Testing proposal creation...");
	try {
		// First, login to get a token
		console.log("📝 Attempting to login...");
		const loginResponse = await axios.post("http://localhost:4000/api/auth/login", {
			email: "test@example.com",
			password: "password123",
		});

		const token = loginResponse.data.token;
		console.log("✅ Login successful, token obtained");

		// Test proposal creation
		console.log("📋 Creating test proposal...");
		const proposalData = {
			jobDescription: "Software Engineer position with Python and React experience",
			company: "Test Company Inc.",
			jobLink: "https://example.com/job",
			coverLetter: "Dear Hiring Manager, I am excited to apply...",
			resume: "John Doe\nSoftware Engineer\nExperience: 5 years...",
			status: "applied",
		};

		const createResponse = await axios.post("http://localhost:4000/api/proposals", proposalData, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		console.log("✅ Proposal created successfully!");
		console.log("Proposal ID:", createResponse.data.proposal.id);
		console.log("Company:", createResponse.data.proposal.company);
		console.log("Status:", createResponse.data.proposal.status);

		// Test getting the proposal
		console.log("📋 Fetching created proposal...");
		const getResponse = await axios.get(`http://localhost:4000/api/proposals/${createResponse.data.proposal.id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		console.log("✅ Proposal retrieved successfully!");
		console.log("Retrieved proposal:", getResponse.data.proposal.company);
	} catch (error) {
		console.error("❌ Error occurred:");
		if (error.response) {
			console.error("Status:", error.response.status);
			console.error("Data:", error.response.data);
		} else {
			console.error("Error:", error.message);
		}
	}
}

testProposalCreation();
