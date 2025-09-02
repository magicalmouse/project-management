// Vercel Serverless Function - Projects CRUD
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
		console.error("Projects API error:", error);
		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({ error: "Invalid token" });
		}
		return res.status(500).json({ error: "Internal server error" });
	}
}

// GET - List all projects or get specific project
async function handleGet(req, res, decoded) {
	const { id } = req.query;

	if (id) {
		// Get specific project
		const projects = await query(
			`SELECT p.*, 
					u1.username as created_by_username, u1.full_name as created_by_name,
					u2.username as assigned_to_username, u2.full_name as assigned_to_name
			 FROM projects p
			 LEFT JOIN users u1 ON p.created_by = u1.id
			 LEFT JOIN users u2 ON p.assigned_to = u2.id
			 WHERE p.id = $1`,
			[id],
		);

		if (projects.length === 0) {
			return res.status(404).json({ error: "Project not found" });
		}

		// Get project tasks
		const tasks = await query(
			`SELECT t.*, u.username, u.full_name 
			 FROM tasks t
			 LEFT JOIN users u ON t.assigned_to = u.id
			 WHERE t.project_id = $1
			 ORDER BY t.created_at DESC`,
			[id],
		);

		return res.json({
			success: true,
			project: { ...projects[0], tasks },
		});
	}
	// List all projects
	const projects = await query(
		`SELECT p.*, 
					u1.username as created_by_username, u1.full_name as created_by_name,
					u2.username as assigned_to_username, u2.full_name as assigned_to_name,
					COUNT(t.id) as task_count,
					COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks
			 FROM projects p
			 LEFT JOIN users u1 ON p.created_by = u1.id
			 LEFT JOIN users u2 ON p.assigned_to = u2.id
			 LEFT JOIN tasks t ON p.id = t.project_id
			 GROUP BY p.id, u1.username, u1.full_name, u2.username, u2.full_name
			 ORDER BY p.created_at DESC`,
	);

	return res.json({
		success: true,
		projects,
	});
}

// POST - Create new project
async function handlePost(req, res, decoded) {
	const { name, description, status = "planning", priority = "medium", start_date, end_date, budget, assigned_to } = req.body;

	if (!name) {
		return res.status(400).json({ error: "Project name is required" });
	}

	const result = await query(
		`INSERT INTO projects (name, description, status, priority, start_date, end_date, budget, assigned_to, created_by)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 RETURNING *`,
		[name, description, status, priority, start_date, end_date, budget, assigned_to, decoded.userId],
	);

	return res.status(201).json({
		success: true,
		message: "Project created successfully",
		project: result[0],
	});
}

// PUT - Update project
async function handlePut(req, res, decoded) {
	const { id } = req.query;
	const { name, description, status, priority, start_date, end_date, budget, spent_budget, progress, assigned_to } = req.body;

	if (!id) {
		return res.status(400).json({ error: "Project ID is required" });
	}

	// Check if project exists
	const existingProject = await query("SELECT * FROM projects WHERE id = $1", [id]);
	if (existingProject.length === 0) {
		return res.status(404).json({ error: "Project not found" });
	}

	const result = await query(
		`UPDATE projects 
		 SET name = COALESCE($1, name),
			 description = COALESCE($2, description),
			 status = COALESCE($3, status),
			 priority = COALESCE($4, priority),
			 start_date = COALESCE($5, start_date),
			 end_date = COALESCE($6, end_date),
			 budget = COALESCE($7, budget),
			 spent_budget = COALESCE($8, spent_budget),
			 progress = COALESCE($9, progress),
			 assigned_to = COALESCE($10, assigned_to)
		 WHERE id = $11
		 RETURNING *`,
		[name, description, status, priority, start_date, end_date, budget, spent_budget, progress, assigned_to, id],
	);

	return res.json({
		success: true,
		message: "Project updated successfully",
		project: result[0],
	});
}

// DELETE - Delete project
async function handleDelete(req, res, decoded) {
	const { id } = req.query;

	if (!id) {
		return res.status(400).json({ error: "Project ID is required" });
	}

	// Check if user is admin or project creator
	const project = await query("SELECT * FROM projects WHERE id = $1", [id]);
	if (project.length === 0) {
		return res.status(404).json({ error: "Project not found" });
	}

	if (decoded.role !== 0 && project[0].created_by !== decoded.userId) {
		return res.status(403).json({ error: "Permission denied" });
	}

	await query("DELETE FROM projects WHERE id = $1", [id]);

	return res.json({
		success: true,
		message: "Project deleted successfully",
	});
}
