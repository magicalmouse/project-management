import { Chart } from "@/components/chart";
import { useTheme } from "@/theme/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Text } from "@/ui/typography";
import { m } from "motion/react";
import { useMemo } from "react";

interface TrendData {
	label: string;
	applications: number;
	interviews: number;
}

interface PersonalTrendsChartProps {
	monthlyTrends: TrendData[];
	loading?: boolean;
	timePeriod?: string;
}

export default function PersonalTrendsChart({ monthlyTrends, loading = false, timePeriod = "month" }: PersonalTrendsChartProps) {
	const { mode } = useTheme();

	const chartData = useMemo(() => {
		if (!monthlyTrends || monthlyTrends.length === 0) {
			// Default categories based on time period
			let defaultCategories = [];
			switch (timePeriod) {
				case "today":
					defaultCategories = ["00:00", "06:00", "12:00", "18:00", "24:00"];
					break;
				case "week":
					defaultCategories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
					break;
				case "month":
					defaultCategories = ["Week 1", "Week 2", "Week 3", "Week 4"];
					break;
				default:
					defaultCategories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
			}

			return {
				series: [
					{ name: "Applications", data: new Array(defaultCategories.length).fill(0) },
					{ name: "Interviews", data: new Array(defaultCategories.length).fill(0) },
				],
				categories: defaultCategories,
			};
		}

		const categories = monthlyTrends.map((trend) => trend.label);
		const applicationsData = monthlyTrends.map((trend) => trend.applications);
		const interviewsData = monthlyTrends.map((trend) => trend.interviews);

		return {
			series: [
				{ name: "Applications", data: applicationsData },
				{ name: "Interviews", data: interviewsData },
			],
			categories,
		};
	}, [monthlyTrends, timePeriod]);

	const chartOptions = useMemo(
		() => ({
			chart: {
				type: "line" as const,
				height: 280,
				toolbar: {
					show: false,
				},
				animations: {
					enabled: true,
					easing: "easeinout",
					speed: 800,
				},
			},
			colors: ["#3b82f6", "#10b981"],
			stroke: {
				curve: "smooth" as const,
				width: 3,
			},
			grid: {
				borderColor: mode === "dark" ? "#374151" : "#e5e7eb",
				strokeDashArray: 4,
			},
			xaxis: {
				categories: chartData.categories,
				labels: {
					style: {
						colors: mode === "dark" ? "#9ca3af" : "#6b7280",
					},
				},
				axisBorder: {
					color: mode === "dark" ? "#374151" : "#e5e7eb",
				},
			},
			yaxis: {
				labels: {
					style: {
						colors: mode === "dark" ? "#9ca3af" : "#6b7280",
					},
				},
			},
			tooltip: {
				theme: mode,
				x: {
					show: false,
				},
				marker: { show: false },
				y: {
					formatter: (value: number) => `${value} ${value === 1 ? "item" : "items"}`,
				},
			},
			legend: {
				position: "top" as const,
				horizontalAlign: "right" as const,
				labels: {
					colors: mode === "dark" ? "#9ca3af" : "#6b7280",
				},
			},
			dataLabels: {
				enabled: false,
			},
			markers: {
				size: 6,
				strokeWidth: 2,
				strokeColors: mode === "dark" ? "#1f2937" : "#ffffff",
				colors: ["#3b82f6", "#10b981"],
			},
			fill: {
				type: "gradient",
				gradient: {
					shadeIntensity: 1,
					opacityFrom: 0.3,
					opacityTo: 0.1,
					stops: [0, 90, 100],
				},
			},
		}),
		[chartData.categories, mode],
	);

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<m.div
							animate={{ rotate: 360 }}
							transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
							className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full"
						/>
						Personal Trends
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-64 flex items-center justify-center">
						<Text className="text-muted-foreground">Loading trends...</Text>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Chart icon">
						<title>Chart</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
						/>
					</svg>
					Personal Trends
				</CardTitle>
			</CardHeader>
			<CardContent>
				{monthlyTrends && monthlyTrends.length > 0 ? (
					<Chart type="line" series={chartData.series} options={chartOptions} height={280} />
				) : (
					<div className="h-64 flex items-center justify-center">
						<div className="text-center">
							<Text className="text-muted-foreground mb-2">No trend data available</Text>
							<Text className="text-sm text-muted-foreground">Start applying to jobs to see your trends</Text>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
