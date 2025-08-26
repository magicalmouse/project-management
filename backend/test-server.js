require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { query } = require("./db");
const { authenticateToken } = require("./middleware/auth");

const app = express();

app.use(
	cors({
		origin: "http://localhost:3001",
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization"],
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	}),
);

app.use(express.json());

// Simple test endpoint
app.get("/api/test", (req, res) => {
	res.json({ message: "Server is working!" });
});

// Test proposals endpoint
app.get("/api/test-proposals", authenticateToken, async (req, res) => {
	try {
		console.log("User:", req.user);

		const proposals = await query("SELECT p.*, u.username, u.email FROM proposals p JOIN users u ON p.user = u.id WHERE p.user = ? LIMIT 5", [req.user.id]);

		res.json({
			success: true,
			proposals: proposals,
			user: req.user,
		});
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ error: error.message });
	}
});

const PORT = 4001;
app.listen(PORT, () => {
	console.log(`Test server running on port ${PORT}`);
});
