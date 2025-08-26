require("dotenv").config();
const bcrypt = require("bcryptjs");
const { query } = require("./db");

async function ensureTestUser() {
	try {
		console.log("Checking if test user exists...");

		// Check if test user exists
		const users = await query("SELECT * FROM users WHERE email = ?", ["test@example.com"]);

		if (users.length > 0) {
			console.log("✅ Test user already exists:", users[0].email);
			return;
		}

		console.log("Creating test user...");

		// Create test user
		const hashedPassword = await bcrypt.hash("password123", 10);
		const result = await query("INSERT INTO users (email, username, password_hash, role) VALUES (?, ?, ?, ?)", [
			"test@example.com",
			"testuser",
			hashedPassword,
			1,
		]);

		console.log("✅ Test user created successfully!");
		console.log("Email: test@example.com");
		console.log("Password: password123");
	} catch (error) {
		console.error("❌ Error:", error.message);
	}
}

ensureTestUser();
