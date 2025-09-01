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
		let errorDetails = null;

		try {
			// First, try to import the database module
			const { query, testConnection } = await import("../../backend/db-postgres.js");

			// Test basic connection first
			const isConnected = await testConnection();
			if (!isConnected) {
				dbStatus = "CONNECTION_FAILED";
				dbError = "testConnection() returned false";
			} else {
				// Test simple query
				const result = await query("SELECT NOW() as current_time, version() as postgres_version, current_database() as database_name");
				dbStatus = "CONNECTED";

				// Get table list to verify schema
				const tableResult = await query(`
					SELECT tablename FROM pg_catalog.pg_tables
					WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
					ORDER BY tablename;
				`);
				const tables = tableResult.map((row) => row.tablename);

				return res.json({
					success: true,
					environment: envCheck,
					database: {
						status: dbStatus,
						connection_test: result[0],
						tables: tables,
						table_count: tables.length,
						timestamp: new Date().toISOString(),
					},
				});
			}
		} catch (error) {
			dbStatus = "ERROR";
			dbError = error.message;

			// Add more detailed error information
			errorDetails = {
				message: error.message,
				code: error.code || "NO_CODE",
				errno: error.errno || "NO_ERRNO",
				syscall: error.syscall || "NO_SYSCALL",
				hostname: error.hostname || "NO_HOSTNAME",
				address: error.address || "NO_ADDRESS",
				port: error.port || "NO_PORT",
			};
		}

		return res.status(500).json({
			success: false,
			environment: envCheck,
			database: {
				status: dbStatus,
				error: dbError,
				error_details: errorDetails,
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			error: "Debug endpoint failed",
			details: error.message,
			timestamp: new Date().toISOString(),
		});
	}
}
