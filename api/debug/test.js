// Debug endpoint to test environment and database
export default async function handler(req, res) {
	// Set CORS headers
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}

	try {
		// Check environment variables
		const envCheck = {
			DATABASE_URL: !!process.env.DATABASE_URL,
			JWT_SECRET: !!process.env.JWT_SECRET,
			NODE_ENV: process.env.NODE_ENV,
			DATABASE_URL_preview: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 30)}...` : "NOT SET",
		};

		// Try to import database module
		let dbStatus = "NOT_TESTED";
		let dbError = null;

		try {
			const { query } = require("../../backend/db-postgres");

			// Test simple query
			const result = await query("SELECT NOW() as current_time, version() as postgres_version");
			dbStatus = "CONNECTED";

			res.json({
				success: true,
				environment: envCheck,
				database: {
					status: dbStatus,
					connection_test: result[0],
					timestamp: new Date().toISOString(),
				},
			});
		} catch (error) {
			dbStatus = "ERROR";
			dbError = error.message;

			res.status(500).json({
				success: false,
				environment: envCheck,
				database: {
					status: dbStatus,
					error: dbError,
					timestamp: new Date().toISOString(),
				},
			});
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			error: "Debug endpoint failed",
			details: error.message,
			timestamp: new Date().toISOString(),
		});
	}
}
