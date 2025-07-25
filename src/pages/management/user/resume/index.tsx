import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import { Input } from "antd";
import { useEffect, useMemo, useState } from "react";
import PDFPreview from "./PDFPreview";
import pdfToText from "react-pdftotext";
import { GLOBAL_CONFIG } from "@/global-config";
import { pdf } from "@react-pdf/renderer";
import ResumePDF from "./ResumePDF";
import { Loader2 } from "lucide-react";

interface ResumeBuilderProps {
	resume: string;
	job_description: string;
	onResumeChange: (value: string) => void;
	onJobDescriptionChange: (value: string) => void;
}

export default function ResumeBuilder({ resume, job_description, onResumeChange, onJobDescriptionChange }: ResumeBuilderProps) {
	const [resumeFile, setResumeFile] = useState<File | null>(null);
	const [jobDescription, setJobDescription] = useState(job_description);
	const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const resumePreviewUrl = useMemo(() => {
		if (resumeFile?.type === "application/pdf") {
			return URL.createObjectURL(resumeFile);
		}
		return null;
	}, [resumeFile]);

	useEffect(() => {
		return () => {
			if (resumePreviewUrl) URL.revokeObjectURL(resumePreviewUrl);
		};
	}, [resumePreviewUrl]);

	useEffect(() => {
		if (generatedPdfUrl) {
		}
	}, [generatedPdfUrl]);

	useEffect(() => {
		onJobDescriptionChange(jobDescription);
	}, [jobDescription]);

	const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setResumeFile(file);
			setGeneratedPdfUrl(null);
		}
	};

	const handleGenerate = async () => {
		if (!resumeFile || !jobDescription) return;
		setIsLoading(true);

		const resume = await extractText();

		const prompt = `Tailor the existing resume to perfectly match the jobdescription provided. This task involves analyzing the job description in detail to understand the specific skills, experiences, and qualifications the employer is seeking. Then, meticulously revise the existing resume to highlight the most relevant aspects of the candidate's background. This includes rephrasing bullet points to emphasize transferable skills, prioritizing experiences that directly relate to the job requirements, and ensuring the resume format and design are professional and it should give non ai generated feeling. Incorporate keywords from the job description to ensure the resume passes through Applicant Tracking Systems (ATS) effectively.   use strong power action verbs but not repeated more than once. Make important verbs and words in bold. add metrics and match all the exact keywords from the job to my summary, experience, soft and hard skills and education. The summary should include my relevant professional experience like my job title and experience in the field and mention my areas of expertise, specializations and skill and one or two impressive achievements to show what I can do and how I can contribute to the company. The summary should be no more than 5 sentences. In the work experience, each experience must include more than 8 lists in details and the right key words that match the job description. It should not be too small. Skills must include more than 8 lists with bullet points that match the job description and others that is relevant. adjust the job titles to best fit the job. It should not be too small. Use words (Adaptability/flexibility, creativity, problem solving, Curiosity, Emotional intelligence, Persistence, Relationship-building, Resourcefulness, sophisticated knowledge, mastery, realized, transformed, augmented.) in the resume. These words (experience, expertise, achieved, influenced, increased) are not recommended in the resume. Update personal expereicne to follow the job description perfectly.
      Ensure the revised resume is:
      * Highly relevant: Maximize alignment with the job description for ATS optimization.
      * Detailed and professional: Provide specific examples and quantifiable achievements where applicable, maintaining a natural, human-written tone.
      * Concise: Remove any irrelevant information not pertinent to the job description.
      * Clearence: Don't include any clearence in the resume.

      Format the entire resume in Markdown, strictly adhering to these rules:
      * The first line must be the candidate's name using a single hash ("#").
      * All contact information ("Phone Number", "Email", "Location") must be on one single line, separated by a pipe ("|"). Phone number should have "@@" prefix.
			* And LinkedIn address on next line like "https://www.linkedin.com/in/..." with "@@" prefix for making line in center.
      * Use a triple hash ("##") for top-level section headings (e.g., "## Summary", "## Education", "## Key Skills", "## Work Experience", "## Clearance").
      * For each work experience entry, the "Job Title", "Company Name", "Location", and "Employment Period" must be on one single line, separated by pipes ("|"). For example: "**Job Title** | Company Name – City, State / Remote | Month Year – Month Year".
      * Use "**" for bolding text.
      * Ensure proper Markdown spacing and line breaks for readability.

      Return only the complete, updated resume content in Markdown format, with no additional explanations or conversational text. The output should be ready for immediate use without further editing.
      Resume:
      ${resume}
      Job Description:
      ${jobDescription}`;

		try {
			// const response = await fetch(`${GLOBAL_CONFIG.geminiApiUrl}?key=${GLOBAL_CONFIG.geminiApiKey}`, {
			// 	method: "POST",
			// 	headers: { "Content-Type": "application/json" },
			// 	body: JSON.stringify({
			// 		contents: [{ parts: [{ text: prompt }] }],
			// 	}),
			// });

			// const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

			const response = await fetch(GLOBAL_CONFIG.openAIUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${GLOBAL_CONFIG.openAIKey}` 
				},
				body: JSON.stringify({
					model: "gpt-3.5-turbo",
					messages: [
						{ role: "user", content: prompt }
					]
				}),
			});

			if (!response.ok) throw new Error("Failed to generate resume");

			const result = await response.json();
			const text = result?.choices?.[0]?.message?.content;
			if (!text) throw new Error("No content returned");

			// Convert Markdown to PDF using ResumePDF component
			const blob = await pdf(<ResumePDF markdownText={text} />).toBlob();
			const blobUrl = URL.createObjectURL(blob);
			setGeneratedPdfUrl(blobUrl);
		} catch (error) {
			console.error("Generation error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownload = () => {
		if (!generatedPdfUrl) return;
		const a = document.createElement("a");
		a.href = generatedPdfUrl;
		const timeSalt = new Date().toLocaleString().replace(/[/:.,]/g, "-");
		const resumePDF = `resume-${timeSalt}.pdf`;
		onResumeChange(resumePDF);
		a.download = resumePDF;
		a.click();
	};

	const extractText = async (): Promise<string> => {
		return await pdfToText(resumeFile!);
	};

	return (
		<div className="flex p-4 gap-4">
			<div className="w-1/2 border rounded-xl shadow p-2 overflow-hidden max-h-[500px]">
				{generatedPdfUrl ? (
					<PDFPreview fileUrl={generatedPdfUrl} />
				) : resumePreviewUrl ? (
					<PDFPreview fileUrl={resumePreviewUrl} />
				) : (
					<div className="text-gray-400 text-center mt-20">Upload a PDF resume to preview it here</div>
				)}
			</div>

			<div className="w-1/2 flex flex-col gap-4">
				<div>
					<label className="text-sm font-medium">Upload Resume (PDF)</label>
					<Input type="file" accept=".pdf" onChange={handleUpload} />
				</div>

				<div>
					<label className="text-sm font-medium">Job Description</label>
					<Textarea
						placeholder="Paste job description here..."
						className="min-h-128 max-h-128"
						value={jobDescription}
						onChange={(e) => setJobDescription(e.target.value)}
					/>
				</div>

				<div className="flex gap-4">
					<Button onClick={handleGenerate} disabled={!resumeFile || !jobDescription || isLoading}>
						{isLoading && <Loader2 className="animate-spin mr-2" />}
						Generate
					</Button>
					<Button variant="outline" onClick={handleDownload} disabled={!generatedPdfUrl}>
						Download
					</Button>
				</div>
			</div>
		</div>
	);
}
