import { GLOBAL_CONFIG } from "@/global-config";

interface ResumeModificationRequest {
	originalResume: string;
	jobDescription: string;
}

interface ResumeModificationResponse {
	modifiedResume: string;
	summary: string;
	keyChanges: string[];
	atsScore?: number;
}

async function callOpenAI(prompt: string): Promise<string> {
	try {
		// Create AbortController for timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

		const response = await fetch(GLOBAL_CONFIG.openAIUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${GLOBAL_CONFIG.openAIKey}`,
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				messages: [
					{
						role: "system",
						content:
							"You are an expert resume optimizer who makes substantial changes to align resumes with specific job requirements. You MUST modify content to match job descriptions while preserving formatting. Do not return unchanged content.",
					},
					{ role: "user", content: prompt },
				],
				temperature: 0.1,
				max_tokens: 2500,
				top_p: 0.8,
			}),
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
		}

		const result = await response.json();
		return result?.choices?.[0]?.message?.content || "";
	} catch (error) {
		if (error.name === "AbortError") {
			throw new Error("Request timed out. Please try again with a shorter resume or job description.");
		}
		console.error("AI Service error:", error);
		throw new Error("Failed to modify resume. Please try again.");
	}
}

export async function modifyResume(request: ResumeModificationRequest): Promise<ResumeModificationResponse> {
	const { originalResume, jobDescription } = request;

	// First, analyze the job description to extract key insights
	let jobInsights = "";
	try {
		const analysis = await analyzeJobDescription(jobDescription);
		jobInsights = `
**JOB ANALYSIS INSIGHTS:**
- Key Skills Required: ${analysis.keySkills.join(", ")}
- Required Experience: ${analysis.requiredExperience.join(", ")}
- ATS Keywords: ${analysis.suggestedKeywords.join(", ")}
- Company Values: ${analysis.companyValues.join(", ")}

**SPECIFIC OPTIMIZATION REQUIREMENTS:**
1. MUST replace generic skills with the specific skills listed above
2. MUST update job descriptions to include the required experience keywords
3. MUST incorporate ATS keywords naturally throughout the resume
4. MUST reflect the company values in the content tone
5. MUST make substantial changes to align with the job requirements
`;
	} catch (error) {
		console.error("Failed to analyze job description for optimization:", error);
		jobInsights = "Optimize resume content to match the job description requirements.";
	}

	const prompt = `
	You are a professional resume optimizer. Your task is to MODIFY the resume content to match the job description while preserving the exact formatting.

	**Job Description:**
	${jobDescription}

	${jobInsights}

	**Original Resume:**
	${originalResume}

	**CRITICAL INSTRUCTIONS:**
	1. You MUST make substantial changes to align the resume with the job requirements
	2. Replace generic terms with specific job-relevant keywords from the analysis
	3. Update skill descriptions to include the required skills
	4. Modify experience descriptions to match the required experience
	5. Incorporate ATS keywords throughout the resume
	6. Reflect company values in the content
	7. Keep EXACT formatting, spacing, bullets, and structure
	8. DO NOT return the original resume unchanged

	**SPECIFIC CHANGES REQUIRED:**
	- In the SUMMARY section: Update to highlight relevant skills and experience for this specific job
	- In the SKILLS section: Replace generic skills with the specific skills from the job analysis
	- In the EXPERIENCE section: Update bullet points to include relevant keywords and achievements
	- Throughout the resume: Use the ATS keywords naturally in descriptions

	**Return JSON:**
	{
		"modifiedResume": "the optimized resume with substantial changes to match the job",
		"summary": "detailed summary of the specific changes made to optimize for this job",
		"keyChanges": ["specific change 1", "specific change 2", "specific change 3"],
		"atsScore": <calculate a realistic ATS score between 60-95 based on keyword match, formatting, and relevance to the job description>
	}

	**ATS Score Calculation Guidelines:**
	- Score 90-95: Excellent keyword match, perfect formatting, highly relevant content
	- Score 80-89: Very good keyword match, good formatting, relevant content
	- Score 70-79: Good keyword match, acceptable formatting, mostly relevant content
	- Score 60-69: Some keyword match, basic formatting, partially relevant content
	- Consider keyword density, formatting quality, and overall relevance to the job description

	IMPORTANT: Make meaningful changes that clearly show the resume has been optimized for this specific job. Do not return the original resume unchanged.
	`;

	console.log("Sending optimization prompt to OpenAI...");
	const response = await callOpenAI(prompt);
	console.log("OpenAI optimization response received:", `${response.substring(0, 300)}...`);

	try {
		const parsedResponse = JSON.parse(response);
		console.log("Parsed optimization result:", {
			summary: parsedResponse.summary,
			keyChanges: parsedResponse.keyChanges,
			atsScore: parsedResponse.atsScore,
			modifiedResumeLength: parsedResponse.modifiedResume?.length || 0,
		});

		// Check if the modified resume is significantly different from the original
		const originalLength = originalResume.length;
		const modifiedLength = parsedResponse.modifiedResume?.length || 0;
		const similarity = Math.abs(originalLength - modifiedLength) / Math.max(originalLength, modifiedLength);

		console.log(`Resume optimization similarity check: ${(similarity * 100).toFixed(1)}% different`);

		if (similarity < 0.1) {
			console.warn("Warning: Modified resume appears very similar to original. This might indicate insufficient changes.");
		}

		return {
			modifiedResume: parsedResponse.modifiedResume,
			summary: parsedResponse.summary,
			keyChanges: parsedResponse.keyChanges || [],
			atsScore: parsedResponse.atsScore,
		};
	} catch (error) {
		console.error("Failed to parse optimization response:", error);
		console.error("Raw response was:", response);

		// If JSON parsing fails, return the raw response as modified resume
		// Calculate a basic ATS score based on response quality
		const responseLength = response.length;
		const hasKeywords = /(experience|skills|development|management|analysis|design|implementation|testing|deployment|optimization)/i.test(response);
		const hasFormatting = /(•|\*|-|\d+\.|\n\n)/.test(response);

		let fallbackAtsScore = 65; // Base score
		if (responseLength > 500) fallbackAtsScore += 10; // Good content length
		if (hasKeywords) fallbackAtsScore += 10; // Has relevant keywords
		if (hasFormatting) fallbackAtsScore += 5; // Has proper formatting

		return {
			modifiedResume: response,
			summary: "Resume has been modified to match the job description",
			keyChanges: ["Content tailored to job requirements"],
			atsScore: Math.min(fallbackAtsScore, 85), // Cap at 85 for fallback
		};
	}
}

export async function generateCoverLetter(jobDescription: string, resume: string, companyName: string): Promise<string> {
	const prompt = `
	Generate a compelling cover letter for the following job application:

	**Company:** ${companyName}
	**Job Description:** ${jobDescription}
	**Resume:** ${resume}

	**Requirements:**
	1. Address the specific requirements in the job description
	2. Highlight relevant experience from the resume
	3. Show enthusiasm for the company and role
	4. Keep it professional but engaging
	5. Length: 3-4 paragraphs maximum
	6. Include specific examples of achievements

	Return only the cover letter text, no additional formatting or explanations.
	`;

	return await callOpenAI(prompt);
}

export async function analyzeJobDescription(jobDescription: string): Promise<{
	keySkills: string[];
	requiredExperience: string[];
	companyValues: string[];
	suggestedKeywords: string[];
}> {
	console.log("analyzeJobDescription called with:", `${jobDescription.substring(0, 100)}...`);

	const prompt = `
	Analyze the following job description and extract key information for resume optimization:

	**Job Description:** ${jobDescription}

	**Please extract and return ONLY a valid JSON object:**
	{
		"keySkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
		"requiredExperience": ["experience1", "experience2", "experience3"],
		"companyValues": ["value1", "value2", "value3"],
		"suggestedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
	}

	**Extraction Guidelines:**
	- Key Skills: Technical skills, programming languages, tools, frameworks
	- Required Experience: Years of experience, specific roles, industry experience
	- Company Values: Culture, work style, company mission, soft skills
	- Suggested Keywords: ATS-friendly terms, industry jargon, specific technologies

	**Important:** Return ONLY the JSON object, no additional text or explanations.
	`;

	console.log("Sending prompt to OpenAI...");
	const response = await callOpenAI(prompt);
	console.log("OpenAI response received:", `${response.substring(0, 200)}...`);

	try {
		// Clean the response to extract just the JSON
		let cleanResponse = response.trim();

		// Remove any markdown code blocks
		if (cleanResponse.startsWith("```json")) {
			cleanResponse = cleanResponse.replace(/```json\n?/, "").replace(/\n?```/, "");
		} else if (cleanResponse.startsWith("```")) {
			cleanResponse = cleanResponse.replace(/```\n?/, "").replace(/\n?```/, "");
		}

		const parsed = JSON.parse(cleanResponse);
		console.log("Parsed analysis result:", parsed);

		// Validate the structure
		if (!parsed.keySkills || !parsed.requiredExperience || !parsed.companyValues || !parsed.suggestedKeywords) {
			throw new Error("Invalid response structure");
		}

		return parsed;
	} catch (error) {
		console.error("Failed to parse analysis response:", error);
		console.error("Raw response was:", response);

		// Return a fallback analysis based on common patterns
		const fallbackAnalysis = {
			keySkills: extractSkillsFromText(jobDescription),
			requiredExperience: extractExperienceFromText(jobDescription),
			companyValues: extractValuesFromText(jobDescription),
			suggestedKeywords: extractKeywordsFromText(jobDescription),
		};

		console.log("Using fallback analysis:", fallbackAnalysis);
		return fallbackAnalysis;
	}
}

// Fallback extraction functions
function extractSkillsFromText(text: string): string[] {
	const skills: string[] = [];
	const skillPatterns = [
		/\b(?:JavaScript|Python|Java|C\+\+|C#|React|Angular|Vue|Node\.js|Express|Django|Flask|SQL|MongoDB|AWS|Azure|Docker|Kubernetes|Git|Agile|Scrum)\b/gi,
		/\b(?:HTML|CSS|TypeScript|PHP|Ruby|Go|Rust|Swift|Kotlin|Scala|R|MATLAB|Tableau|PowerBI|Jira|Confluence|Slack|Zoom|Teams)\b/gi,
	];

	for (const pattern of skillPatterns) {
		const matches = text.match(pattern);
		if (matches) {
			skills.push(...matches.map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()));
		}
	}

	return [...new Set(skills)].slice(0, 5);
}

function extractExperienceFromText(text: string): string[] {
	const experience: string[] = [];
	const expPatterns = [/\b(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)\b/gi, /\b(?:senior|junior|mid-level|entry-level|lead|principal|architect)\b/gi];

	for (const pattern of expPatterns) {
		const matches = text.match(pattern);
		if (matches) {
			experience.push(...matches.map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()));
		}
	}

	return [...new Set(experience)].slice(0, 3);
}

function extractValuesFromText(text: string): string[] {
	const values: string[] = [];
	const valuePatterns = [
		/\b(?:collaboration|teamwork|innovation|creativity|problem-solving|communication|leadership|adaptability|flexibility|remote|hybrid|fast-paced|startup|enterprise)\b/gi,
	];

	for (const pattern of valuePatterns) {
		const matches = text.match(pattern);
		if (matches) {
			values.push(...matches.map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()));
		}
	}

	return [...new Set(values)].slice(0, 3);
}

function extractKeywordsFromText(text: string): string[] {
	const keywords: string[] = [];
	const keywordPatterns = [
		/\b(?:full-stack|frontend|backend|fullstack|software|web|mobile|cloud|devops|data|machine learning|AI|artificial intelligence|blockchain|cybersecurity)\b/gi,
	];

	for (const pattern of keywordPatterns) {
		const matches = text.match(pattern);
		if (matches) {
			keywords.push(...matches.map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()));
		}
	}

	return [...new Set(keywords)].slice(0, 5);
}

const AIService = {
	modifyResume,
	generateCoverLetter,
	analyzeJobDescription,
};

export default AIService;
