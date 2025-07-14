// ResumePDF.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
	page: {
		fontSize: 11,
		padding: 40,
		lineHeight: 1.5,
		fontFamily: "Helvetica",
	},
	section: {
		marginBottom: 20,
	},
	mainTitle: {
		fontSize: 22,
		textAlign: "center",
		marginBottom: 20,
		textTransform: "uppercase",
		fontWeight: "bold",
	},
	heading: {
		fontSize: 14,
		fontWeight: "bold",
		marginBottom: 6,
		textTransform: "uppercase",
	},
	divider: {
		height: 1,
		backgroundColor: "#333",
		marginVertical: 6,
	},
	bullet: {
		marginLeft: 10,
		marginBottom: 4,
		display: "flex",
		flexDirection: "row",
	},
	bulletSymbol: {
		marginRight: 4,
	},
	text: {
		marginBottom: 4,
	},
	bold: {
		fontWeight: "bold",
	},
});

interface Props {
	markdownText: string;
}

const parseBoldText = (line: string) => {
	const parts = line.split(/(\*\*[^*]+\*\*)/g);
	return parts.map((part, idx) => {
		if (part.startsWith("**") && part.endsWith("**")) {
			return (
				<Text key={idx} style={styles.bold}>
					{part.slice(2, -2)}
				</Text>
			);
		}
		return <Text key={idx}>{part}</Text>;
	});
};

const ResumePDF: React.FC<Props> = ({ markdownText }) => {
	const lines = markdownText.split("\n").filter((line) => !line.trim().startsWith("```"));

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{lines.map((line, i) => {
					if (i === 0 && line.startsWith("# ")) {
						return (
							<View key={i} style={styles.section}>
								<Text style={styles.mainTitle}>{line.replace("# ", "")}</Text>
							</View>
						);
					}

					if (line.startsWith("## ")) {
						return (
							<View key={i} style={styles.section}>
								<Text style={styles.heading}>{line.replace("## ", "")}</Text>
								<View style={styles.divider} />
							</View>
						);
					}

					if (line.startsWith("# ")) {
						return (
							<View key={i} style={styles.section}>
								<Text style={styles.heading}>{line.replace("# ", "")}</Text>
								<View style={styles.divider} />
							</View>
						);
					}

					if (line.startsWith("- ") || line.startsWith("* ")) {
						return (
							<View key={i} style={styles.bullet}>
								<Text style={styles.bulletSymbol}>•</Text>
								<Text>{parseBoldText(line.slice(2))}</Text>
							</View>
						);
					}

					if (line.startsWith("@@")) {
						return (
							<View key={i} style={styles.section}>
								<Text style={{ textAlign: "center" }}>{line.replace("@@", "")}</Text>
							</View>
						);
					}

					return (
						<Text key={i} style={styles.text}>
							{parseBoldText(line)}
						</Text>
					);
				})}
			</Page>
		</Document>
	);
};

export default ResumePDF;
