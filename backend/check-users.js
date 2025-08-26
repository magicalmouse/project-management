const { query } = require("./db");

async function checkUsers() {
	try {
		console.log("Checking users in database...");

		const users = await query("SELECT id, email, username, role FROM users LIMIT 10");
		console.log("✅ Users found:", users.length);

		users.forEach((user, index) => {
			console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}, Username: ${user.username}, Role: ${user.role}`);
		});
	} catch (error) {
		console.error("❌ Error checking users:", error.message);
	}
}

checkUsers();
