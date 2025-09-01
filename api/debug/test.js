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

		// Try to import database module and test connection
		let dbStatus = "NOT_TESTED";
		let dbError = null;
		let errorDetails = null;

		try {
			// Import the database module
			const { pool } = await import("../../backend/db-postgres.js");

			// Test direct pool connection to get actual error details
			const client = await pool.connect();
			try {
				const result = await client.query("SELECT NOW() as current_time, version() as postgres_version, current_database() as database_name");
				dbStatus = "CONNECTED";

				// Get table list to verify schema
				const tableResult = await client.query(`
					SELECT tablename FROM pg_catalog.pg_tables
					WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
					ORDER BY tablename;
				`);
				const tables = tableResult.rows.map((row) => row.tablename);

				return res.json({
					success: true,
					environment: envCheck,
					database: {
						status: dbStatus,
						connection_test: result.rows[0],
						tables: tables,
						table_count: tables.length,
						timestamp: new Date().toISOString(),
					},
				});
			} finally {
				client.release();
			}
		} catch (error) {
			dbStatus = "CONNECTION_ERROR";
			dbError = error.message;

			// Add comprehensive error information
			errorDetails = {
				message: error.message,
				code: error.code || "NO_CODE",
				errno: error.errno || "NO_ERRNO",
				syscall: error.syscall || "NO_SYSCALL",
				hostname: error.hostname || "NO_HOSTNAME",
				address: error.address || "NO_ADDRESS",
				port: error.port || "NO_PORT",
				stack: error.stack ? error.stack.substring(0, 1000) : "NO_STACK",
				name: error.name || "NO_NAME",
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
