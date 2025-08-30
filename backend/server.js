const express = require("express");
const cors = require("cors");
const path = require("node:path");

// Import controllers
const { getDashboardStats } = require("./dashboard");
const { seedTestData, clearTestData } = require("./seed");
const authController = require("./controllers/authController");
const userController = require("./controllers/userController");
const profileController = require("./controllers/profileController");
const proposalController = require("./controllers/proposalController");
const interviewController = require("./controllers/interviewController");
const savedResumeController = require("./controllers/savedResumeController");

// Import multer for file uploads
const multer = require("multer");
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
});

// Import middleware
const { authenticateToken, requireAdmin } = require("./middleware/auth");

const app = express();

// Configure CORS to allow Authorization header
const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:3001", "http://localhost:3002"];

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);

			if (corsOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization"],
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	}),
);

app.use(express.json({ limit: "10mb" })); // Increased limit for file uploads

// Health check
app.get("/api/health", (req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// =============================================================================
// AUTH ROUTES (Public)
// =============================================================================
app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);
app.post("/api/auth/refresh", authController.refreshToken);
app.post("/api/auth/logout", authController.logout);

// =============================================================================
// PROTECTED ROUTES (Require Authentication)
// =============================================================================

// Current user info
app.get("/api/auth/me", authenticateToken, authController.getCurrentUser);

// User Management
app.get("/api/users", authenticateToken, requireAdmin, userController.getAllUsers);
app.get("/api/users/:id", authenticateToken, userController.getUserById);
app.put("/api/users/:id", authenticateToken, userController.updateUser);
app.delete("/api/users/:id", authenticateToken, requireAdmin, userController.deleteUser);
app.put("/api/users/:id/password", authenticateToken, userController.updatePassword);

// Profile Management
app.get("/api/profiles/:userId", authenticateToken, profileController.getProfile);
app.get("/api/profiles", authenticateToken, (req, res) => profileController.getProfile(req, res)); // Current user profile
app.put("/api/profiles/:userId", authenticateToken, profileController.updateProfile);
app.put("/api/profiles", authenticateToken, (req, res) => profileController.updateProfile(req, res)); // Current user profile
app.delete("/api/profiles/:userId", authenticateToken, profileController.deleteProfile);

// Job Applications/Proposals
app.get("/api/proposals", authenticateToken, proposalController.getAllProposals);
app.get("/api/proposals/:id", authenticateToken, proposalController.getProposalById);
app.post("/api/proposals", authenticateToken, proposalController.createProposal);
app.put("/api/proposals/:id", authenticateToken, proposalController.updateProposal);
app.delete("/api/proposals/:id", authenticateToken, proposalController.deleteProposal);

// Save uploaded PDF files
app.post("/api/proposals/save-resume-pdf", authenticateToken, upload.single("resume"), proposalController.saveResumePDF);

// Serve uploaded PDF files
app.get("/api/uploads/resumes/:filename", (req, res) => {
	const filename = req.params.filename;
	const token = req.query.token || req.headers.authorization?.replace("Bearer ", "");

	// Verify token
	if (!token) {
		return res.status(401).json({ error: "Access token required" });
	}

	try {
		// Import JWT and verify the token
		const jwt = require("jsonwebtoken");
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			return res.status(401).json({ error: "Invalid token" });
		}

		const filePath = path.join(__dirname, "uploads", "resumes", filename);

		// Check if file exists
		const fs = require("node:fs");
		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ error: "File not found" });
		}

		// Set appropriate headers for PDF
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

		// Send the file
		res.sendFile(filePath);
	} catch (error) {
		console.error("Token verification error:", error);
		return res.status(401).json({ error: "Invalid token" });
	}
});

// Interview Management
app.get("/api/interviews", authenticateToken, interviewController.getAllInterviews);
app.get("/api/interviews/:id", authenticateToken, interviewController.getInterviewById);
app.post("/api/interviews", authenticateToken, interviewController.createInterview);
app.put("/api/interviews/:id", authenticateToken, interviewController.updateInterview);
app.delete("/api/interviews/:id", authenticateToken, interviewController.deleteInterview);
app.get("/api/interviews/:id/scheduled-resume", authenticateToken, interviewController.getScheduledResume);
app.get("/api/interviews/:id/scheduled-resume-pdf", interviewController.getScheduledResumePDFFile);
app.get("/api/test-resume/:filename", (req, res) => {
	const fs = require("node:fs");
	const path = require("node:path");
	const { filename } = req.params;

	console.log("🔍 Test endpoint called for filename:", filename);

	const scheduleResumesDir = path.join(__dirname, "uploads", "schedule", "resumes");
	const filePath = path.join(scheduleResumesDir, filename);

	console.log("🔍 Looking for file at:", filePath);

	if (!fs.existsSync(filePath)) {
		return res.status(404).json({ error: "File not found" });
	}

	const pdfBuffer = fs.readFileSync(filePath);
	res.setHeader("Content-Type", "application/pdf");
	res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
	res.send(pdfBuffer);
});

// Saved Resume Management
app.get("/api/saved-resumes", authenticateToken, savedResumeController.getSavedResumeList);
app.get("/api/saved-resumes/:id", authenticateToken, savedResumeController.getSavedResumeById);
app.get("/api/resume-files/:id", authenticateToken, savedResumeController.getResumeFile);
app.get("/api/resume-files", authenticateToken, savedResumeController.listJsonFiles);
app.post("/api/saved-resumes", authenticateToken, savedResumeController.createAndUpdateSavedResume);
app.put("/api/saved-resumes/:id", authenticateToken, savedResumeController.createAndUpdateSavedResume);
app.delete("/api/saved-resumes/:id", authenticateToken, savedResumeController.deleteSavedResume);

// Dashboard Analytics
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
	try {
		const timePeriod = req.query.period || "month"; // Default to 'month'
		const stats = await getDashboardStats(req.user.id, req.user.role, timePeriod);
		res.json(stats);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Test Data Management (Admin only)
app.post("/api/dashboard/seed-test-data", authenticateToken, requireAdmin, async (req, res) => {
	try {
		await seedTestData();
		res.json({ success: true, message: "Test data seeded successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/dashboard/clear-test-data", authenticateToken, requireAdmin, async (req, res) => {
	try {
		await clearTestData();
		res.json({ success: true, message: "Test data cleared successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// =============================================================================
// ERROR HANDLING
// =============================================================================
app.use((err, req, res, next) => {
	console.error("Error:", err);
	res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: "Endpoint not found" });
});

// =============================================================================
// START SERVER
// =============================================================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`🚀 Backend API server running on port ${PORT}`);
	console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
	console.log(`👤 Auth: http://localhost:${PORT}/api/auth/login`);
	console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
});
