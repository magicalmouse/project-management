const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "project_management",
	port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

async function query(sql, params) {
	const [rows] = await pool.query(sql, params);
	return rows;
}

module.exports = { pool, query };
