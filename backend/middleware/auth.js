const jwt = require("jsonwebtoken");
const { query } = require("../db");

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

// Middleware to verify JWT token
async function authenticateToken(req, res, next) {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(" ")[1]; // Bearer TOKEN

	if (!token) {
		return res.status(401).json({ error: "Access token required" });
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);

		// Get user from database to ensure user still exists
		const users = await query("SELECT id, email, username, role, status FROM users WHERE id = ?", [decoded.userId]);

		if (users.length === 0) {
			return res.status(401).json({ error: "User not found" });
		}

		if (users[0].status !== 1) {
			return res.status(401).json({ error: "User account is disabled" });
		}

		req.user = users[0];
		next();
	} catch (error) {
		return res.status(403).json({ error: "Invalid or expired token" });
	}
}

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
	if (req.user.role !== 0) {
		return res.status(403).json({ error: "Admin access required" });
	}
	next();
}

// Generate JWT token
function generateToken(user) {
	return jwt.sign(
		{
			userId: user.id,
			email: user.email,
			role: user.role,
		},
		JWT_SECRET,
		{ expiresIn: "24h" },
	);
}

// Generate refresh token
function generateRefreshToken(user) {
	return jwt.sign(
		{
			userId: user.id,
			type: "refresh",
		},
		JWT_SECRET,
		{ expiresIn: "7d" },
	);
}

module.exports = {
	authenticateToken,
	requireAdmin,
	generateToken,
	generateRefreshToken,
	JWT_SECRET,
};
