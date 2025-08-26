import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type React from "react";

/**
 * FormattedTextPDF
 * - Produces a crisp, single-column resume layout similar to the screenshot:
 *   NAME (centered, uppercase) + contact line
 *   SECTION headers with bottom rule
 *   Inline skill categories
 *   Job titles (bold) and company/date/location (italic line)
 *   Bulleted accomplishments
 * - Hyphenation disabled everywhere for predictable wrapping
 */

const styles = StyleSheet.create({
	page: {
		fontSize: 11,
		paddingTop: 36,
		paddingBottom: 36,
		paddingHorizontal: 40,
		lineHeight: 1,
		fontFamily: "Helvetica",
		color: "#000000",
	},

	// Generic text
	text: {
		marginBottom: 4,
		lineHeight: 1,
		textAlign: "left",
		hyphenationCallback: () => [],
	},

	// Bullets
	bulletRow: {
		flexDirection: "row",
		marginBottom: 4,
		alignItems: "flex-start",
		gap: 6,
	},
	bulletPoint: {
		width: 10,
		fontSize: 11,
		textAlign: "center",
		hyphenationCallback: () => [],
	},
	bulletText: {
		flex: 1,
		lineHeight: 1,
		textAlign: "left",
		hyphenationCallback: () => [],
	},

	// Header block (name + contact)
	nameTitle: {
		fontSize: 22,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 8,
		textTransform: "uppercase",
		letterSpacing: 1.2,
		hyphenationCallback: () => [],
	},
	jobTitle: {
		fontSize: 12,
		textAlign: "center",
		marginBottom: 8,
		hyphenationCallback: () => [],
	},
	contactInfo: {
		fontSize: 10,
		textAlign: "center",
		marginBottom: 10,
		hyphenationCallback: () => [],
	},

	// Section header with rule
	sectionHeader: {
		fontSize: 11,
		fontWeight: "bold",
		marginTop: 16,
		marginBottom: 8,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		borderBottomWidth: 1,
		borderBottomColor: "#000000",
		paddingBottom: 3,
		textAlign: "left",
		lineHeight: 1.4,
		hyphenationCallback: () => [],
	},

	// Inline subheaders
	heading: {
		fontSize: 12,
		fontWeight: "bold",
		marginTop: 10,
		marginBottom: 5,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		textAlign: "left",
		hyphenationCallback: () => [],
	},
	subheading: {
		fontSize: 12,
		fontWeight: "bold",
		marginTop: 6,
		marginBottom: 3,
		textAlign: "left",
		hyphenationCallback: () => [],
	},

	// Skills categories (e.g., "Programming Language:")
	skillCategory: {
		fontSize: 11,
		fontWeight: "bold",
		marginTop: 4,
		marginBottom: 2,
		textAlign: "left",
		hyphenationCallback: () => [],
	},

	// Company / date / location line
	jobHeader: {
		fontSize: 11,
		marginTop: 2,
		marginBottom: 4,
		textAlign: "left",
		fontStyle: "italic",
		hyphenationCallback: () => [],
	},

	// Minor spacers for empty lines
	spacerSm: { height: 2 },
	spacerMd: { height: 6 },
});

interface Props {
	text: string;
}

const SECTION_TITLES = new Set([
	"SUMMARY",
	"SKILLS",
	"EXPERIENCE",
	"EDUCATION",
	"OBJECTIVE",
	"PROJECTS",
	"CERTIFICATIONS",
	"AWARDS",
	"PUBLICATIONS",
	"LANGUAGES",
	"INTERESTS",
	"REFERENCES",
]);

const normalize = (s: string) =>
	s
		.replace(/\u2013|\u2014/g, "–") // normalize en/em dashes to en dash for consistency
		.replace(/\u00A0/g, " ") // nbsp -> space
		.trim();

const looksLikeName = (line: string, idx: number) => {
	if (idx > 3) return false;
	const words = line.trim().split(/\s+/);
	return words.length >= 2 && words.length <= 4 && words.every((w) => /^[A-Za-z.'-]+$/.test(w));
};

const looksLikeContact = (line: string, idx: number) => {
	if (idx > 8) return false;
	const t = line.toLowerCase();
	return (
		/@/.test(t) ||
		/[\d\-\(\)\s+]{10,}/.test(t) ||
		/linkedin\.com/.test(t) ||
		/github\.com/.test(t) ||
		/[A-Z][a-z]+,\s*[A-Z]{2}/.test(line) ||
		/\b\d{5}\b/.test(line)
	);
};

const looksLikeHeaderJobTitle = (line: string, idx: number) => {
	// Job titles typically appear after the name in the header section
	if (idx > 5) return false;

	// Look for patterns like "Senior Software Engineer", "Full Stack Developer", etc.
	const titlePatterns = [
		/\b(Senior|Lead|Principal|Staff)\s+(Software|Full\s*Stack|Frontend|Backend|DevOps|Data|Machine\s*Learning|AI|ML)\s+(Engineer|Developer|Architect|Scientist)\b/i,
		/\b(Software|Full\s*Stack|Frontend|Backend|DevOps|Data|Machine\s*Learning|AI|ML)\s+(Engineer|Developer|Architect|Scientist)\b/i,
		/\b(Project|Product|Program|Engineering)\s+Manager\b/i,
		/\b(UI|UX|Web|Mobile|Cloud|Security|Database|System|Network)\s+(Developer|Engineer|Designer|Administrator|Architect)\b/i,
	];

	return titlePatterns.some((pattern) => pattern.test(line));
};

// Job title like "Senior Full Stack Developer", "Full Stack Engineer", etc.
const looksLikeJobTitle = (line: string) => /^(Senior\s+)?(Full\s*Stack|Frontend|Back\s*end|Backend|Software|Application)\s+(Developer|Engineer)$/i.test(line);

// Company + dates + location line
const looksLikeCompanyInfo = (line: string) => {
	// Examples:
	// Cognizant • Feb 2023 – Nov 2024 • Philadelphia, PA
	// ViroIntl • Jul 2018 – Jan 2023 • Philadelphia, PA
	return /^[A-Za-z0-9&().,\-\/\s]+(\s*[•·]\s*|\s+-\s+)[A-Za-z]{3}\s+\d{4}/.test(line) || /^[A-Za-z0-9&().,\-\/\s]+(\s*[•·]\s*|\s+-\s+)\d{4}/.test(line);
};

// Bullet detector – supports •, -, *, ◦, etc.
const looksLikeBullet = (line: string) => /^[•▪▫‣⁃◦\-\*]\s+/.test(line);

const FormattedTextPDF: React.FC<Props> = ({ text }) => {
	const lines = text.split("\n").map(normalize);

	// Separate resume content from job description content
	const resumeContent: string[] = [];
	const jobDescriptionContent: string[] = [];
	let currentSection: string[] = [];
	let isInJobDescription = false;

	lines.forEach((line, index) => {
		// Check if we're entering job description content (look for job posting indicators)
		const isJobDescriptionStart =
			line.toLowerCase().includes("job description") ||
			line.toLowerCase().includes("position:") ||
			line.toLowerCase().includes("role:") ||
			line.toLowerCase().includes("company:") ||
			line.toLowerCase().includes("phoenix support services") ||
			line.toLowerCase().includes("wordpress full stack developer") ||
			line.toLowerCase().includes("key responsibilities") ||
			line.toLowerCase().includes("requirements:");

		if (isJobDescriptionStart && !isInJobDescription) {
			// Add any accumulated content to resume content
			if (currentSection.length > 0) {
				resumeContent.push(...currentSection);
				currentSection = [];
			}
			isInJobDescription = true;
			jobDescriptionContent.push(line);
			return;
		}

		// If we're in job description section, add to that
		if (isInJobDescription) {
			jobDescriptionContent.push(line);
			return;
		}

		// Otherwise, accumulate in current section (resume content)
		currentSection.push(line);
	});

	// Add any remaining content to resume content
	if (currentSection.length > 0) {
		resumeContent.push(...currentSection);
	}

	const renderLine = (line: string, index: number, isResumeContent = false) => {
		const next = isResumeContent ? resumeContent[index + 1] || "" : jobDescriptionContent[index + 1] || "";
		const prev = isResumeContent ? resumeContent[index - 1] || "" : jobDescriptionContent[index - 1] || "";

		// Empty line -> smart spacer
		if (!line) {
			const nextIsSection = SECTION_TITLES.has(next.toUpperCase()) || looksLikeJobTitle(next);
			if (prev && next && nextIsSection) return <View key={`${isResumeContent ? "resume" : "job"}-${index}`} style={styles.spacerMd} />;
			if (prev && next) return <View key={`${isResumeContent ? "resume" : "job"}-${index}`} style={styles.spacerSm} />;
			return <View key={`${isResumeContent ? "resume" : "job"}-${index}`} />;
		}

		// Name
		if (looksLikeName(line, index)) {
			return (
				<Text key={`${isResumeContent ? "resume" : "job"}-${index}`} style={styles.nameTitle}>
					{line}
				</Text>
			);
		}

		// Job title in header
		if (looksLikeHeaderJobTitle(line, index)) {
			return (
				<Text key={`${isResumeContent ? "resume" : "job"}-${index}`} style={styles.jobTitle}>
					{line}
				</Text>
			);
		}

		// Contact
		if (looksLikeContact(line, index)) {
			// Ensure center and nice " • " separators if user provided commas
			const pretty = /•/.test(line) || / \u2022 /.test(line) ? line : line.replace(/\s*[|,]\s*/g, " • ");
			return (
				<Text key={`${isResumeContent ? "resume" : "job"}-${index}`} style={styles.contactInfo}>
					{pretty}
				</Text>
			);
		}

		// Section headers
		if (SECTION_TITLES.has(line.toUpperCase())) {
			return (
				<Text key={`${isResumeContent ? "resume" : "job"}-${index}`} style={styles.sectionHeader}>
					{line.toUpperCase()}
				</Text>
			);
		}

		// Skill categories (e.g., "Programming Language:")
		if (/^[A-Z][A-Za-z\s]+:\s*$/.test(line) && line.length < 60) {
			return (
				<Text key={`${isResumeContent ? "resume" : "job"}-${index}`} style={styles.skillCategory}>
					{line}
				</Text>
			);
		}

		// Job title (bold)
		if (looksLikeJobTitle(line)) {
			return (
				<Text key={`${isResumeContent ? "resume" : "job"}-${index}`} style={styles.subheading}>
					{line}
				</Text>
			);
		}

		// Company / date / location (italic)
		if (looksLikeCompanyInfo(line)) {
			return (
				<Text key={`${isResumeContent ? "resume" : "job"}-${index}`} style={styles.jobHeader}>
					{line}
				</Text>
			);
		}

		// Bullets
		if (looksLikeBullet(line)) {
			const bulletChar = line.charAt(0);
			const content = line.slice(1).trim();
			return (
				<View key={`${isResumeContent ? "resume" : "job"}-${index}`} style={styles.bulletRow}>
					<Text style={styles.bulletPoint}>{bulletChar}</Text>
					<Text style={styles.bulletText}>{content}</Text>
				</View>
			);
		}

		// "All caps mini headings" (rare; keep after main section detection)
		const isAllCaps = line === line.toUpperCase() && line.length > 2 && line.length < 50;
		const isHeadingPattern = /^[A-Z][A-Z\s]+[A-Z]$/.test(line) && line.length < 50;
		const endsWithColon = line.endsWith(":") && line.length < 50;
		if (isAllCaps || isHeadingPattern || endsWithColon) {
			return (
				<Text key={`${isResumeContent ? "resume" : "job"}-${index}`} style={styles.heading}>
					{line}
				</Text>
			);
		}

		// Default body text
		return (
			<Text key={`${isResumeContent ? "resume" : "job"}-${index}`} style={styles.text}>
				{line}
			</Text>
		);
	};

	return (
		<Document>
			<Page size="A4" style={styles.page} wrap>
				<View style={{ width: "100%" }}>
					{/* Resume content first */}
					{resumeContent.map((line: string, i: number) => renderLine(line, i, true))}

					{/* Job description content at the bottom (last) */}
					{jobDescriptionContent.map((line: string, i: number) => renderLine(line, i, false))}
				</View>
			</Page>
		</Document>
	);
};

export default FormattedTextPDF;
