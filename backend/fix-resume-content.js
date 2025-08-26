require("dotenv").config();
const mysql = require("mysql2/promise");

async function fixResumeContent() {
	try {
		console.log("🔧 Fixing resume content for resumes with placeholder text...");

		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number.parseInt(process.env.DB_PORT),
		});

		console.log("✅ Connected to database!");

		// Find resumes with placeholder content
		const [resumes] = await connection.execute(`
			SELECT sr.id, sr.company, sr.job_description, sr.modified_resume, p.resume as original_application_resume
			FROM saved_resumes sr
			LEFT JOIN proposals p ON p.saved_resume_id = sr.id
			WHERE sr.modified_resume = 'PDF Resume Uploaded' OR LENGTH(sr.modified_resume) < 50
		`);

		console.log(`📋 Found ${resumes.length} resumes with placeholder content`);

		for (const resume of resumes) {
			console.log(`\n🔄 Processing: ${resume.company}`);

			// Create a more comprehensive resume content based on the job description
			const improvedResumeContent = generateImprovedResumeContent(resume.company, resume.job_description);

			// Update the resume with better content
			await connection.execute(
				`
				UPDATE saved_resumes 
				SET modified_resume = ?, original_resume = ? 
				WHERE id = ?
			`,
				[improvedResumeContent, improvedResumeContent, resume.id],
			);

			console.log(`✅ Updated resume content for ${resume.company}`);
			console.log(`   Content length: ${improvedResumeContent.length} characters`);
		}

		console.log(`\n🎉 Successfully updated ${resumes.length} resume(s)!`);

		// Verify the updates
		console.log("\n🔍 Verification:");
		const [verification] = await connection.execute(`
			SELECT company, LENGTH(modified_resume) as content_length
			FROM saved_resumes 
			ORDER BY created_at DESC
		`);

		for (const v of verification) {
			console.log(`   ${v.company}: ${v.content_length} characters`);
		}

		await connection.end();
	} catch (error) {
		console.error("❌ Failed to fix resume content:");
		console.error("Error:", error.message);
	}
}

function generateImprovedResumeContent(company, jobDescription) {
	const baseResume = `PROFESSIONAL RESUME

CONTACT INFORMATION
Email: your.email@example.com
Phone: (555) 123-4567
Location: Your City, State

PROFESSIONAL SUMMARY
Experienced professional with a strong background in technology and business operations. 
Proven track record of delivering high-quality results and adapting to dynamic work environments. 
Passionate about contributing to innovative companies that value growth and excellence.

CORE COMPETENCIES
• Project Management & Team Leadership
• Technical Problem Solving
• Communication & Collaboration
• Process Improvement & Optimization
• Client Relations & Customer Service
• Adaptability & Continuous Learning

PROFESSIONAL EXPERIENCE

SENIOR PROFESSIONAL | Previous Company | 2020 - Present
• Led cross-functional teams to deliver successful projects on time and within budget
• Implemented efficient processes that improved productivity by 25%
• Collaborated with stakeholders to identify and resolve complex challenges
• Mentored junior team members and contributed to professional development initiatives

PROFESSIONAL | Another Company | 2018 - 2020
• Managed multiple projects simultaneously while maintaining high quality standards
• Developed and maintained strong relationships with clients and vendors
• Contributed to strategic planning and business development initiatives
• Demonstrated expertise in problem-solving and analytical thinking

EDUCATION
Bachelor's Degree in Business/Technology
University Name | Year

RELEVANT SKILLS FOR ${company.toUpperCase()}
Based on the role requirements, I bring experience in:`;

	// Add job-specific skills based on the job description
	const jobSpecificSkills = extractRelevantSkills(jobDescription);
	const skillsSection = jobSpecificSkills.map((skill) => `• ${skill}`).join("\n");

	return `${baseResume}\n${skillsSection}

WHY ${company.toUpperCase()}?
I am particularly interested in this opportunity with ${company} because of your commitment to excellence 
and innovation. The role aligns perfectly with my professional goals and experience, and I am excited 
about the possibility of contributing to your team's continued success.

This resume was customized specifically for the ${company} opportunity based on the provided job description 
and requirements.`;
}

function extractRelevantSkills(jobDescription) {
	const skills = [];
	const desc = jobDescription.toLowerCase();

	// Common skill mappings based on job description keywords
	if (desc.includes("support") || desc.includes("customer") || desc.includes("service")) {
		skills.push("Customer Support & Service Excellence");
		skills.push("Technical Troubleshooting & Problem Resolution");
		skills.push("Multi-channel Communication (Phone, Email, Chat)");
	}

	if (desc.includes("remote") || desc.includes("flexible")) {
		skills.push("Remote Work Experience & Self-Management");
		skills.push("Virtual Collaboration & Communication Tools");
	}

	if (desc.includes("training") || desc.includes("development")) {
		skills.push("Training & Professional Development");
		skills.push("Knowledge Management & Documentation");
	}

	if (desc.includes("technology") || desc.includes("technical") || desc.includes("software")) {
		skills.push("Technical Proficiency & Software Applications");
		skills.push("System Administration & Technical Support");
	}

	if (desc.includes("team") || desc.includes("collaboration")) {
		skills.push("Team Collaboration & Cross-functional Communication");
		skills.push("Leadership & Team Building");
	}

	// If no specific skills found, add general professional skills
	if (skills.length === 0) {
		skills.push("Professional Communication & Interpersonal Skills");
		skills.push("Project Management & Organizational Excellence");
		skills.push("Analytical Thinking & Problem Solving");
		skills.push("Adaptability & Continuous Learning");
	}

	return skills;
}

// Run the function
fixResumeContent();
