// Vercel Serverless Function - Tasks CRUD
import jwt from "jsonwebtoken";
import { query } from "../../backend/db-postgres.js";

export default async function handler(req, res) {
	// Set CORS headers
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	try {
		// Verify JWT token
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ error: "No token provided" });
		}

		const token = authHeader.substring(7);
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		switch (req.method) {
			case "GET":
				return await handleGet(req, res, decoded);
			case "POST":
				return await handlePost(req, res, decoded);
			case "PUT":
				return await handlePut(req, res, decoded);
			case "DELETE":
				return await handleDelete(req, res, decoded);
			default:
				return res.status(405).json({ error: "Method not allowed" });
		}
	} catch (error) {
		console.error("Tasks API error:", error);
		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({ error: "Invalid token" });
		}
		return res.status(500).json({ error: "Internal server error" });
	}
}

// GET - List tasks or get specific task
async function handleGet(req, res, decoded) {
	const { id, project_id, assigned_to, status } = req.query;

	if (id) {
		// Get specific task
		const tasks = await query(
			`SELECT t.*, 
					p.name as project_name,
					u1.username as assigned_to_username, u1.full_name as assigned_to_name,
					u2.username as created_by_username, u2.full_name as created_by_name
			 FROM tasks t
			 LEFT JOIN projects p ON t.project_id = p.id
			 LEFT JOIN users u1 ON t.assigned_to = u1.id
			 LEFT JOIN users u2 ON t.created_by = u2.id
			 WHERE t.id = $1`,
			[id],
		);

		if (tasks.length === 0) {
			return res.status(404).json({ error: "Task not found" });
		}

		return res.json({
			success: true,
			task: tasks[0],
		});
	}
	// Build dynamic query based on filters
	let queryStr = `
			SELECT t.*, 
				   p.name as project_name,
				   u1.username as assigned_to_username, u1.full_name as assigned_to_name,
				   u2.username as created_by_username, u2.full_name as created_by_name
			FROM tasks t
			LEFT JOIN projects p ON t.project_id = p.id
			LEFT JOIN users u1 ON t.assigned_to = u1.id
			LEFT JOIN users u2 ON t.created_by = u2.id
			WHERE 1=1
		`;

	const params = [];
	let paramCount = 0;

	if (project_id) {
		paramCount++;
		queryStr += ` AND t.project_id = $${paramCount}`;
		params.push(project_id);
	}

	if (assigned_to) {
		paramCount++;
		queryStr += ` AND t.assigned_to = $${paramCount}`;
		params.push(assigned_to);
	}

	if (status) {
		paramCount++;
		queryStr += ` AND t.status = $${paramCount}`;
		params.push(status);
	}

	// If not admin, only show tasks user is involved with
	if (decoded.role !== 0) {
		paramCount++;
		queryStr += ` AND (t.assigned_to = $${paramCount} OR t.created_by = $${paramCount})`;
		params.push(decoded.userId);
	}

	queryStr += " ORDER BY t.created_at DESC";

	const tasks = await query(queryStr, params);

	return res.json({
		success: true,
		tasks,
	});
}

// POST - Create new task
async function handlePost(req, res, decoded) {
	const { project_id, title, description, status = "todo", priority = "medium", assigned_to, due_date, estimated_hours } = req.body;

	if (!project_id || !title) {
		return res.status(400).json({ error: "Project ID and title are required" });
	}

	// Verify project exists
	const project = await query("SELECT id FROM projects WHERE id = $1", [project_id]);
	if (project.length === 0) {
		return res.status(404).json({ error: "Project not found" });
	}

	const result = await query(
		`INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by, due_date, estimated_hours)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 RETURNING *`,
		[project_id, title, description, status, priority, assigned_to, decoded.userId, due_date, estimated_hours],
	);

	return res.status(201).json({
		success: true,
		message: "Task created successfully",
		task: result[0],
	});
}

// PUT - Update task
async function handlePut(req, res, decoded) {
	const { id } = req.query;
	const { title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours } = req.body;

	if (!id) {
		return res.status(400).json({ error: "Task ID is required" });
	}

	// Check if task exists and user has permission
	const existingTask = await query("SELECT * FROM tasks WHERE id = $1", [id]);
	if (existingTask.length === 0) {
		return res.status(404).json({ error: "Task not found" });
	}

	// Non-admin users can only update tasks they created or are assigned to
	if (decoded.role !== 0 && existingTask[0].created_by !== decoded.userId && existingTask[0].assigned_to !== decoded.userId) {
		return res.status(403).json({ error: "Permission denied" });
	}

	// Set completed_at when status changes to completed
	let completed_at = null;
	if (status === "completed" && existingTask[0].status !== "completed") {
		completed_at = new Date().toISOString();
	} else if (status !== "completed") {
		completed_at = null;
	}

	const result = await query(
		`UPDATE tasks 
		 SET title = COALESCE($1, title),
			 description = COALESCE($2, description),
			 status = COALESCE($3, status),
			 priority = COALESCE($4, priority),
			 assigned_to = COALESCE($5, assigned_to),
			 due_date = COALESCE($6, due_date),
			 estimated_hours = COALESCE($7, estimated_hours),
			 actual_hours = COALESCE($8, actual_hours),
			 completed_at = COALESCE($9, completed_at)
		 WHERE id = $10
		 RETURNING *`,
		[title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours, completed_at, id],
	);

	return res.json({
		success: true,
		message: "Task updated successfully",
		task: result[0],
	});
}

// DELETE - Delete task
async function handleDelete(req, res, decoded) {
	const { id } = req.query;

	if (!id) {
		return res.status(400).json({ error: "Task ID is required" });
	}

	// Check if task exists and user has permission
	const task = await query("SELECT * FROM tasks WHERE id = $1", [id]);
	if (task.length === 0) {
		return res.status(404).json({ error: "Task not found" });
	}

	if (decoded.role !== 0 && task[0].created_by !== decoded.userId) {
		return res.status(403).json({ error: "Permission denied" });
	}

	await query("DELETE FROM tasks WHERE id = $1", [id]);

	return res.json({
		success: true,
		message: "Task deleted successfully",
	});
}
