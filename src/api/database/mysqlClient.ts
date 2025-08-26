// Conditional import for mysql2 - only available in Node.js environment
const getMysql = async () => {
	if (typeof window === "undefined") {
		// Server-side (Node.js) environment
		const mysql = await import("mysql2/promise");
		return mysql.default;
	}
	// Client-side (browser) environment - provide mock
	return {
		createPool: () => ({
			getConnection: () => Promise.reject(new Error("Database not available in browser")),
			execute: () => Promise.reject(new Error("Database not available in browser")),
		}),
	};
};

// MySQL connection configuration
const dbConfig = {
	host: import.meta.env.VITE_DB_HOST || "127.0.0.1",
	user: import.meta.env.VITE_DB_USER || "root",
	password: import.meta.env.VITE_DB_PASSWORD || "",
	database: import.meta.env.VITE_DB_NAME || "project_management",
	port: Number.parseInt(import.meta.env.VITE_DB_PORT || "3306"),
	connectTimeout: 60000,
	acquireTimeout: 60000,
	timeout: 60000,
};

// Create connection pool for better performance
let pool: any;
const initializePool = async () => {
	if (!pool) {
		const mysql = await getMysql();
		pool = mysql.createPool({
			...dbConfig,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
		});
	}
	return pool;
};

// Test connection function
export const testConnection = async () => {
	try {
		const poolInstance = await initializePool();
		const connection = await poolInstance.getConnection();
		console.log("Connected to MySQL database successfully");
		connection.release();
		return true;
	} catch (error) {
		console.error("Failed to connect to MySQL database:", error);
		return false;
	}
};

// Execute query function
export const executeQuery = async (query: string, params?: any[]): Promise<any[]> => {
	try {
		const poolInstance = await initializePool();
		const [rows] = await poolInstance.execute(query, params);
		return rows as any[];
	} catch (error) {
		console.error("Database query error:", error);
		throw error;
	}
};

// Get connection for transactions
export const getConnection = async () => {
	const poolInstance = await initializePool();
	return await poolInstance.getConnection();
};

export default initializePool;
