const { query } = require("../db");
const { copyResumeToSchedule, getScheduledResumeData, getScheduledResumePDF } = require("../utils/scheduleResumeUtils");
const fs = require("node:fs");
const path = require("node:path");

// Get all interviews (admin sees all, user sees only their own)
async function getAllInterviews(req, res) {
	try {
		const { page = 1, limit = 10, progress, startDate, endDate } = req.query;
		const pageNum = Number.parseInt(page) || 1;
		const limitNum = Number.parseInt(limit) || 10;
		const offset = (pageNum - 1) * limitNum;

		let whereClause = "";
		const queryParams = [];

		// Role-based filtering
		if (req.user.role !== 0) {
			whereClause = "WHERE i.user = ?";
			queryParams.push(req.user.id);
		}

		// Additional filters
		if (progress) {
			whereClause += `${whereClause ? " AND" : "WHERE"} i.progress = ?`;
			queryParams.push(progress);
		}

		if (startDate) {
			whereClause += `${whereClause ? " AND" : "WHERE"} i.meeting_date >= ?`;
			queryParams.push(startDate);
		}

		if (endDate) {
			whereClause += `${whereClause ? " AND" : "WHERE"} i.meeting_date <= ?`;
			queryParams.push(endDate);
		}

		const interviews = await query(
			`
			SELECT i.*, u.username, u.email
			FROM interviews i
			JOIN users u ON i.user = u.id
			${whereClause}
			ORDER BY i.meeting_date DESC
			LIMIT ? OFFSET ?
		`,
			[...queryParams, limitNum, offset],
		);

		// Get total count for pagination
		const countResult = await query(
			`
			SELECT COUNT(*) as total
			FROM interviews i
			JOIN users u ON i.user = u.id
			${whereClause}
		`,
			queryParams,
		);

		const total = countResult[0].total;

		console.log("Raw interviews from database:", interviews);
		res.json({
			success: true,
			interviews: interviews.map((interview) => ({
				id: interview.id,
				proposal: interview.proposal,
				user: interview.user,
				profile: interview.profile,
				meetingTitle: interview.meeting_title,
				meetingDate: interview.meeting_date,
				meetingLink: interview.meeting_link,
				interviewer: interview.interviewer,
				progress: interview.progress,
				notes: interview.notes,
				feedback: interview.feedback,
				jobDescription: interview.job_description,
				selectedResumeId: interview.selected_resume_id,
				resumeLink: interview.resume_link,
				createdAt: interview.created_at,
				updatedAt: interview.updated_at,
				userInfo: {
					username: interview.username,
					email: interview.email,
					firstName: null,
					lastName: null,
				},
				proposalInfo: {
					company: null,
					jobDescription: null,
				},
			})),
			pagination: {
				page: pageNum,
				limit: limitNum,
				total,
				pages: Math.ceil(total / limitNum),
			},
		});
	} catch (error) {
		console.error("Get all interviews error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

// Get interview by ID
async function getInterviewById(req, res) {
	try {
		const { id } = req.params;

		const interviews = await query(
			`
			SELECT i.*, u.username, u.email,
				   pr.first_name, pr.last_name,
				   p.company, p.job_description as proposal_job_description
			FROM interviews i
			JOIN users u ON i.user = u.id
			LEFT JOIN profiles pr ON i.user = pr.user
			LEFT JOIN proposals p ON i.proposal = p.id
			WHERE i.id = ?
		`,
			[id],
		);

		if (interviews.length === 0) {
			return res.status(404).json({ error: "Interview not found" });
		}

		const interview = interviews[0];

		// Check if user can access this interview (admin or owner)
		if (req.user.role !== 0 && req.user.id !== interview.user) {
			return res.status(403).json({ error: "Access denied" });
		}

		res.json({
			success: true,
			interview: {
				id: interview.id,
				proposal: interview.proposal,
				user: interview.user,
				profile: interview.profile,
				meetingTitle: interview.meeting_title,
				meetingDate: interview.meeting_date,
				meetingLink: interview.meeting_link,
				interviewer: interview.interviewer,
				progress: interview.progress,
				notes: interview.notes,
				feedback: interview.feedback,
				jobDescription: interview.job_description,
				selectedResumeId: interview.selected_resume_id,
				resumeLink: interview.resume_link,
				createdAt: interview.created_at,
				updatedAt: interview.updated_at,
				userInfo: {
					username: interview.username,
					email: interview.email,
					firstName: interview.first_name,
					lastName: interview.last_name,
				},
				proposalInfo: {
					company: interview.company,
					jobDescription: interview.proposal_job_description,
				},
			},
		});
	} catch (error) {
		console.error("Get interview by ID error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

// Create new interview
async function createInterview(req, res) {
	try {
		const {
			proposal,
			profile,
			meetingTitle,
			meetingDate,
			meetingLink,
			interviewer,
			progress = 0,
			notes,
			feedback,
			jobDescription,
			selectedResumeId,
			resumeLink,
		} = req.body;

		if (!meetingTitle || !meetingDate) {
			return res.status(400).json({ error: "Meeting title and date are required" });
		}

		// Convert ISO date string to MySQL datetime format
		let formattedMeetingDate = meetingDate;
		if (meetingDate) {
			try {
				const date = new Date(meetingDate);
				formattedMeetingDate = date.toISOString().slice(0, 19).replace("T", " ");
			} catch (error) {
				console.error("Error formatting meeting date:", error);
				return res.status(400).json({ error: "Invalid meeting date format" });
			}
		}

		// Convert empty strings to NULL for foreign key fields
		const formattedProposal = proposal === "" ? null : proposal;
		const formattedProfile = profile === "" ? null : profile;

		// If proposal is provided, verify user owns it (unless admin)
		if (formattedProposal && req.user.role !== 0) {
			const proposals = await query("SELECT user FROM proposals WHERE id = ?", [formattedProposal]);
			if (proposals.length === 0 || proposals[0].user !== req.user.id) {
				return res.status(403).json({ error: "Invalid proposal or access denied" });
			}
		}

		// Generate UUID for the interview
		const interviewId = require("node:crypto").randomUUID();

		await query(
			`
			INSERT INTO interviews (
				id, proposal, user, profile, meeting_title, meeting_date, meeting_link,
				interviewer, progress, notes, feedback, job_description, selected_resume_id, resume_link, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
		`,
			[
				interviewId,
				formattedProposal,
				req.user.id,
				formattedProfile,
				meetingTitle,
				formattedMeetingDate,
				meetingLink,
				interviewer,
				progress,
				notes,
				feedback,
				jobDescription,
				selectedResumeId || null,
				resumeLink || null,
			],
		);

		// Copy selected resume to schedule folder if provided
		if (selectedResumeId) {
			try {
				await copyResumeToSchedule(interviewId, selectedResumeId);
			} catch (error) {
				console.error("Warning: Failed to copy resume to schedule:", error);
				// Don't fail the interview creation if resume copying fails
			}
		}

		// Generate resume link if resume was selected but no link was provided
		if (selectedResumeId && !resumeLink) {
			const generatedResumeLink = `/api/interviews/${interviewId}/scheduled-resume-pdf`;
			await query("UPDATE interviews SET resume_link = ? WHERE id = ?", [generatedResumeLink, interviewId]);
		}

		// Link the selected resume to the job application (proposal) if both exist
		if (selectedResumeId && formattedProposal) {
			try {
				await query("UPDATE proposals SET saved_resume_id = ? WHERE id = ?", [selectedResumeId, formattedProposal]);
				console.log(`✅ Linked resume ${selectedResumeId} to job application ${formattedProposal}`);
			} catch (error) {
				console.error("Warning: Failed to link resume to job application:", error);
				// Don't fail the interview creation if linking fails
			}
		}

		// Get created interview
		const createdInterview = await query(
			`
			SELECT i.*, u.username, u.email,
				   pr.first_name, pr.last_name,
				   p.company, p.job_description as proposal_job_description
			FROM interviews i
			JOIN users u ON i.user = u.id
			LEFT JOIN profiles pr ON i.user = pr.user
			LEFT JOIN proposals p ON i.proposal = p.id
			WHERE i.id = ?
		`,
			[interviewId],
		);

		const interview = createdInterview[0];

		res.status(201).json({
			success: true,
			interview: {
				id: interview.id,
				proposal: interview.proposal,
				user: interview.user,
				profile: interview.profile,
				meetingTitle: interview.meeting_title,
				meetingDate: interview.meeting_date,
				meetingLink: interview.meeting_link,
				interviewer: interview.interviewer,
				progress: interview.progress,
				notes: interview.notes,
				feedback: interview.feedback,
				jobDescription: interview.job_description,
				createdAt: interview.created_at,
				updatedAt: interview.updated_at,
				userInfo: {
					username: interview.username,
					email: interview.email,
					firstName: interview.first_name,
					lastName: interview.last_name,
				},
				proposalInfo: {
					company: interview.company,
					jobDescription: interview.proposal_job_description,
				},
			},
		});
	} catch (error) {
		console.error("Create interview error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

// Update interview
async function updateInterview(req, res) {
	try {
		const { id } = req.params;
		const { proposal, profile, meetingTitle, meetingDate, meetingLink, interviewer, progress, notes, feedback, jobDescription, selectedResumeId, resumeLink } =
			req.body;

		// Check if interview exists and user can update it
		const existingInterviews = await query("SELECT user FROM interviews WHERE id = ?", [id]);

		if (existingInterviews.length === 0) {
			return res.status(404).json({ error: "Interview not found" });
		}

		// Check if user can update this interview (admin or owner)
		if (req.user.role !== 0 && req.user.id !== existingInterviews[0].user) {
			return res.status(403).json({ error: "Access denied" });
		}

		// Build update query
		const updateFields = [];
		const values = [];

		// Convert ISO date string to MySQL datetime format
		let formattedMeetingDate = meetingDate;
		if (meetingDate) {
			try {
				const date = new Date(meetingDate);
				formattedMeetingDate = date.toISOString().slice(0, 19).replace("T", " ");
			} catch (error) {
				console.error("Error formatting meeting date:", error);
			}
		}

		// Convert empty strings to NULL for foreign key fields
		const formattedProposal = proposal === "" ? null : proposal;
		const formattedProfile = profile === "" ? null : profile;

		const fieldsMap = {
			proposal: formattedProposal,
			profile: formattedProfile,
			meeting_title: meetingTitle,
			meeting_date: formattedMeetingDate,
			meeting_link: meetingLink,
			interviewer,
			progress,
			notes,
			feedback,
			job_description: jobDescription,
			selected_resume_id: selectedResumeId || null,
			resume_link: resumeLink || null,
		};

		for (const key of Object.keys(fieldsMap)) {
			if (fieldsMap[key] !== undefined) {
				updateFields.push(`${key} = ?`);
				values.push(fieldsMap[key]);
			}
		}

		if (updateFields.length === 0) {
			return res.status(400).json({ error: "No valid fields to update" });
		}

		updateFields.push("updated_at = NOW()");
		values.push(id);

		await query(`UPDATE interviews SET ${updateFields.join(", ")} WHERE id = ?`, values);

		// Copy selected resume to schedule folder if provided
		if (selectedResumeId) {
			try {
				await copyResumeToSchedule(id, selectedResumeId);
			} catch (error) {
				console.error("Warning: Failed to copy resume to schedule:", error);
				// Don't fail the interview update if resume copying fails
			}
		}

		// Generate resume link if resume was selected but no link was provided
		if (selectedResumeId && !resumeLink) {
			const generatedResumeLink = `/api/interviews/${id}/scheduled-resume-pdf`;
			await query("UPDATE interviews SET resume_link = ? WHERE id = ?", [generatedResumeLink, id]);
		}

		// Link the selected resume to the job application (proposal) if both exist
		if (selectedResumeId && formattedProposal) {
			try {
				await query("UPDATE proposals SET saved_resume_id = ? WHERE id = ?", [selectedResumeId, formattedProposal]);
				console.log(`✅ Linked resume ${selectedResumeId} to job application ${formattedProposal}`);
			} catch (error) {
				console.error("Warning: Failed to link resume to job application:", error);
				// Don't fail the interview update if linking fails
			}
		}

		// Get updated interview
		const updatedInterview = await query(
			`
			SELECT i.*, u.username, u.email,
				   pr.first_name, pr.last_name,
				   p.company, p.job_description as proposal_job_description
			FROM interviews i
			JOIN users u ON i.user = u.id
			LEFT JOIN profiles pr ON i.user = pr.user
			LEFT JOIN proposals p ON i.proposal = p.id
			WHERE i.id = ?
		`,
			[id],
		);

		const interview = updatedInterview[0];

		res.json({
			success: true,
			interview: {
				id: interview.id,
				proposal: interview.proposal,
				user: interview.user,
				profile: interview.profile,
				meetingTitle: interview.meeting_title,
				meetingDate: interview.meeting_date,
				meetingLink: interview.meeting_link,
				interviewer: interview.interviewer,
				progress: interview.progress,
				notes: interview.notes,
				feedback: interview.feedback,
				jobDescription: interview.job_description,
				createdAt: interview.created_at,
				updatedAt: interview.updated_at,
				userInfo: {
					username: interview.username,
					email: interview.email,
					firstName: interview.first_name,
					lastName: interview.last_name,
				},
				proposalInfo: {
					company: interview.company,
					jobDescription: interview.proposal_job_description,
				},
			},
		});
	} catch (error) {
		console.error("Update interview error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

// Get scheduled resume for an interview
async function getScheduledResume(req, res) {
	try {
		const { id } = req.params;

		// Check if interview exists and user can access it
		const existingInterviews = await query("SELECT user FROM interviews WHERE id = ?", [id]);

		if (existingInterviews.length === 0) {
			return res.status(404).json({ error: "Interview not found" });
		}

		// Check if user can access this interview (admin or owner)
		if (req.user.role !== 0 && req.user.id !== existingInterviews[0].user) {
			return res.status(403).json({ error: "Access denied" });
		}

		// Get the scheduled resume data
		const scheduledResumeData = await getScheduledResumeData(id);

		if (!scheduledResumeData) {
			return res.status(404).json({ error: "No scheduled resume found for this interview" });
		}

		res.json({
			success: true,
			scheduledResume: scheduledResumeData,
		});
	} catch (error) {
		console.error("Get scheduled resume error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

// Get scheduled resume PDF file
async function getScheduledResumePDFFile(req, res) {
	try {
		console.log("🔍 getScheduledResumePDFFile called with params:", req.params);
		console.log("🔍 Full request URL:", req.url);
		console.log("🔍 Query params:", req.query);
		const { id } = req.params;

		// Handle token from query parameter or Authorization header
		const token = req.query.token || req.headers.authorization?.replace("Bearer ", "");
		console.log("🔍 Token found:", !!token);

		if (!token) {
			return res.status(401).json({ error: "Access token required" });
		}

		// Verify token
		const jwt = require("jsonwebtoken");
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-this-in-production");
			console.log("🔍 Token decoded successfully for user:", decoded.userId);
		} catch (error) {
			console.log("🔍 Token verification failed:", error.message);
			return res.status(401).json({ error: "Invalid or expired token" });
		}

		// Get user from database
		const users = await query("SELECT id, email, username, role, status FROM users WHERE id = ?", [decoded.userId]);
		if (users.length === 0) {
			console.log("🔍 User not found in database");
			return res.status(401).json({ error: "User not found" });
		}

		const user = users[0];
		console.log("🔍 User found:", user.email, "role:", user.role);
		if (user.status !== 1) {
			return res.status(401).json({ error: "User account is disabled" });
		}

		// Check if interview exists and user can access it
		const existingInterviews = await query("SELECT user FROM interviews WHERE id = ?", [id]);
		console.log("🔍 Interview lookup result:", existingInterviews);

		if (existingInterviews.length === 0) {
			return res.status(404).json({ error: "Interview not found" });
		}

		// Check if user can access this interview (admin or owner)
		if (user.role !== 0 && user.id !== existingInterviews[0].user) {
			console.log("🔍 Access denied - user role:", user.role, "user id:", user.id, "interview user:", existingInterviews[0].user);
			return res.status(403).json({ error: "Access denied" });
		}

		// Get the scheduled PDF file path from the schedule folder
		const interviews = await query(
			`
			SELECT i.meeting_title, i.meeting_date, sr.company
			FROM interviews i
			JOIN saved_resumes sr ON i.selected_resume_id = sr.id
			WHERE i.id = ?
		`,
			[id],
		);

		if (interviews.length === 0) {
			return res.status(404).json({ error: "Interview not found" });
		}

		const interview = interviews[0];

		// Construct the expected filename in the schedule folder
		const date = new Date(interview.meeting_date).toISOString().split("T")[0];
		const meetingTitle = interview.meeting_title.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 30);
		const companyName = interview.company ? interview.company.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 20) : "Unknown";

		// Look for the PDF file in the schedule/resumes directory
		const scheduleResumesDir = path.join(__dirname, "..", "uploads", "schedule", "resumes");
		const files = fs.readdirSync(scheduleResumesDir);
		const expectedPattern = `schedule_${date}_${meetingTitle}_${companyName}`;

		const matchingFile = files.find((file) => file.startsWith(expectedPattern) && file.endsWith(".pdf"));

		if (!matchingFile) {
			return res.status(404).json({ error: "Scheduled PDF file not found" });
		}

		const scheduledPdfPath = path.join(scheduleResumesDir, matchingFile);

		if (!fs.existsSync(scheduledPdfPath)) {
			return res.status(404).json({ error: "Scheduled PDF file not found on disk" });
		}

		// Read the scheduled PDF file directly
		const pdfBuffer = fs.readFileSync(scheduledPdfPath);

		// Set headers for PDF download with cache-busting
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", `attachment; filename="interview_resume_${id}_${Date.now()}.pdf"`);
		res.setHeader("Content-Length", pdfBuffer.length);
		res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		res.setHeader("Pragma", "no-cache");
		res.setHeader("Expires", "0");

		// Send the PDF buffer
		res.send(pdfBuffer);
	} catch (error) {
		console.error("Get scheduled resume PDF error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

// Delete interview
async function deleteInterview(req, res) {
	try {
		const { id } = req.params;

		// Check if interview exists and user can delete it
		const existingInterviews = await query("SELECT user FROM interviews WHERE id = ?", [id]);

		if (existingInterviews.length === 0) {
			return res.status(404).json({ error: "Interview not found" });
		}

		// Check if user can delete this interview (admin or owner)
		if (req.user.role !== 0 && req.user.id !== existingInterviews[0].user) {
			return res.status(403).json({ error: "Access denied" });
		}

		await query("DELETE FROM interviews WHERE id = ?", [id]);

		res.json({
			success: true,
			message: "Interview deleted successfully",
		});
	} catch (error) {
		console.error("Delete interview error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

module.exports = {
	getAllInterviews,
	getInterviewById,
	createInterview,
	updateInterview,
	deleteInterview,
	getScheduledResume,
	getScheduledResumePDFFile,
};
