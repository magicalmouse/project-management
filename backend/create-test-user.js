const bcrypt = require("bcryptjs");
const { query } = require("./db");

async function createTestUser() {
	try {
		console.log("Creating test user with proper password...");

		const email = "test@example.com";
		const username = "testuser";
		const password = "password123";
		const role = 1; // Regular user

		// Hash the password
		const passwordHash = await bcrypt.hash(password, 12);

		// Check if user already exists
		const existingUser = await query("SELECT id FROM users WHERE email = ?", [email]);

		if (existingUser.length > 0) {
			console.log("User already exists, updating password...");
			await query("UPDATE users SET password_hash = ? WHERE email = ?", [passwordHash, email]);
			console.log("✅ Password updated for existing user");
		} else {
			console.log("Creating new user...");
			await query("INSERT INTO users (email, username, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())", [
				email,
				username,
				passwordHash,
				role,
				1,
			]);
			console.log("✅ New user created");
		}

		console.log("Test user credentials:");
		console.log("Email:", email);
		console.log("Password:", password);
		console.log("Username:", username);
	} catch (error) {
		console.error("❌ Error creating test user:", error.message);
	}
}

createTestUser();
