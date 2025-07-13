// ResumePDF.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontSize: 11,
    padding: 30,
    lineHeight: 1.5,
    fontFamily: "Helvetica",
  },
  section: { marginBottom: 12 },
  heading: { fontSize: 14, fontWeight: "bold", marginBottom: 6 },
  bullet: { marginLeft: 10, marginBottom: 4 },
  text: { marginBottom: 4 },
  bold: { fontWeight: "bold" },
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
  const lines = markdownText
    .split("\n")
    .filter((line) => !line.trim().startsWith("```")); // remove ```markdown and ```

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {lines.map((line, i) => {
          if (line.startsWith("# ")) {
            return (
              <Text key={i} style={[styles.heading, { fontSize: 18 }]}>
                {line.replace("# ", "")}
              </Text>
            );
          }
          if (line.startsWith("## ")) {
            return (
              <Text key={i} style={styles.heading}>
                {line.replace("## ", "")}
              </Text>
            );
          }
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
              <Text key={i} style={styles.bullet}>
                • {parseBoldText(line.slice(2))}
              </Text>
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
