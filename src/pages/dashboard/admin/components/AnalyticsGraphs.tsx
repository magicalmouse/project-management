import dashboardService, { type DashboardStats } from "@/api/services/dashboardService";
import interviewService from "@/api/services/interviewService";
import proposalService from "@/api/services/proposalService";
import { useAuth } from "@/components/auth/use-auth";
import { Chart } from "@/components/chart/chart";
import { useChart } from "@/components/chart/useChart";
import Icon from "@/components/icon/icon";
import type { InterviewInfo, ProposalInfo } from "@/types/entity";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Text, Title } from "@/ui/typography";
import { cn } from "@/utils";
import { useEffect, useState } from "react";

interface AnalyticsGraphsProps {
	timeFilter: string;
}

export default function AnalyticsGraphs({ timeFilter }: AnalyticsGraphsProps) {
	const { user, access_token } = useAuth();
	const [loading, setLoading] = useState(true);
	const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
	const [applications, setApplications] = useState<ProposalInfo[]>([]);
	const [interviews, setInterviews] = useState<InterviewInfo[]>([]);
	const [analyticsFilter, setAnalyticsFilter] = useState("overview");

	// Fetch all data for analytics
	useEffect(() => {
		const fetchAnalyticsData = async () => {
			if (!user || !access_token) return;

			setLoading(true);
			try {
				// Fetch dashboard stats
				const stats = await dashboardService.getDashboardStats();
				setDashboardStats(stats);

				// Fetch applications for detailed analytics
				const proposalsResponse = await proposalService.getProposalList({
					limit: 1000,
				});
				setApplications(proposalsResponse.proposals);

				// Fetch interviews for detailed analytics
				const interviewsResponse = await interviewService.getInterviewList(access_token, {
					limit: 1000,
				});
				setInterviews(interviewsResponse.interviews);
			} catch (error) {
				console.error("Failed to fetch analytics data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchAnalyticsData();
	}, [user, access_token]);

	// Process data for charts based on time filter
	const processedData = (() => {
		if (!applications.length && !interviews.length) return null;

		const now = new Date();
		const startDate = new Date();
		let dateFormat = (date: Date) => date.toLocaleDateString();

		switch (timeFilter) {
			case "today":
				startDate.setHours(0, 0, 0, 0);
				dateFormat = (date: Date) => `${date.getHours()}:00`;
				break;
			case "week":
				startDate.setDate(now.getDate() - 7);
				dateFormat = (date: Date) => date.toLocaleDateString();
				break;
			case "month":
				startDate.setMonth(now.getMonth() - 1);
				dateFormat = (date: Date) => date.toLocaleDateString();
				break;
			default:
				startDate.setFullYear(now.getFullYear() - 1);
				dateFormat = (date: Date) => date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
		}

		// Create time series data
		const timeSeriesData: Record<string, { applications: number; interviews: number; offers: number }> = {};

		// Process applications
		for (const app of applications.filter((app) => new Date(app.applied_date || "") >= startDate)) {
			const date = new Date(app.applied_date || "");
			const key = dateFormat(date);
			if (!timeSeriesData[key]) {
				timeSeriesData[key] = { applications: 0, interviews: 0, offers: 0 };
			}
			timeSeriesData[key].applications++;
			if (app.status === "offered") {
				timeSeriesData[key].offers++;
			}
		}

		// Process interviews
		for (const interview of interviews.filter((interview) => new Date(interview.meeting_date || "") >= startDate)) {
			const date = new Date(interview.meeting_date || "");
			const key = dateFormat(date);
			if (!timeSeriesData[key]) {
				timeSeriesData[key] = { applications: 0, interviews: 0, offers: 0 };
			}
			timeSeriesData[key].interviews++;
		}

		return timeSeriesData;
	})();

	// Chart configurations
	const timeSeriesChart = useChart({
		series: [
			{
				name: "Applications",
				data: processedData ? Object.values(processedData).map((d) => d.applications) : [],
			},
			{
				name: "Interviews",
				data: processedData ? Object.values(processedData).map((d) => d.interviews) : [],
			},
			{
				name: "Offers",
				data: processedData ? Object.values(processedData).map((d) => d.offers) : [],
			},
		],
		xaxis: {
			categories: processedData ? Object.keys(processedData) : [],
		},
		colors: ["#3b82f6", "#f59e0b", "#10b981"],
	});

	// Success funnel data
	const funnelData = {
		applied: applications.length,
		interviewing: applications.filter((app) => app.status === "interviewing").length,
		offered: applications.filter((app) => app.status === "offered").length,
	};

	const funnelChart = useChart({
		series: [
			{
				name: "Count",
				data: [funnelData.applied, funnelData.interviewing, funnelData.offered],
			},
		],
		chart: { type: "bar" },
		xaxis: {
			categories: ["Applied", "Interviewing", "Offered"],
		},
		colors: ["#3b82f6"],
		plotOptions: {
			bar: {
				horizontal: false,
				borderRadius: 4,
			},
		},
	});

	// Company analysis
	const companyStats = applications.reduce(
		(acc, app) => {
			const company = app.company || "Unknown";
			if (!acc[company]) {
				acc[company] = {
					total: 0,
					interviews: 0,
					offers: 0,
					rejections: 0,
					successRate: 0,
				};
			}
			acc[company].total++;
			if (app.status === "interviewing") acc[company].interviews++;
			if (app.status === "offered") acc[company].offers++;
			if (app.status === "rejected") acc[company].rejections++;
			acc[company].successRate = acc[company].total > 0 ? (acc[company].offers / acc[company].total) * 100 : 0;
			return acc;
		},
		{} as Record<string, { total: number; interviews: number; offers: number; rejections: number; successRate: number }>,
	);

	const topCompanies = Object.entries(companyStats)
		.sort(([, a], [, b]) => b.total - a.total)
		.slice(0, 10);

	// Monthly trends
	const monthlyTrends = (() => {
		const months = [];
		const now = new Date();
		for (let i = 11; i >= 0; i--) {
			const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
			months.push({
				month: date.toLocaleDateString("en-US", { month: "short" }),
				applications: applications.filter((app) => {
					const appDate = new Date(app.applied_date || "");
					return appDate.getMonth() === date.getMonth() && appDate.getFullYear() === date.getFullYear();
				}).length,
				interviews: interviews.filter((interview) => {
					const intDate = new Date(interview.meeting_date || "");
					return intDate.getMonth() === date.getMonth() && intDate.getFullYear() === date.getFullYear();
				}).length,
			});
		}
		return months;
	})();

	const monthlyChart = useChart({
		series: [
			{
				name: "Applications",
				data: monthlyTrends.map((m) => m.applications),
			},
			{
				name: "Interviews",
				data: monthlyTrends.map((m) => m.interviews),
			},
		],
		xaxis: {
			categories: monthlyTrends.map((m) => m.month),
		},
		colors: ["#3b82f6", "#f59e0b"],
	});

	// User performance metrics
	const userMetrics = applications.reduce(
		(acc, app) => {
			const userEmail = (app as any).userInfo?.email || "Unknown";
			if (!acc[userEmail]) {
				acc[userEmail] = {
					applications: 0,
					interviews: 0,
					offers: 0,
					successRate: 0,
					responseRate: 0,
				};
			}
			acc[userEmail].applications++;
			if (app.status === "interviewing") acc[userEmail].interviews++;
			if (app.status === "offered") acc[userEmail].offers++;

			acc[userEmail].successRate = acc[userEmail].applications > 0 ? (acc[userEmail].offers / acc[userEmail].applications) * 100 : 0;
			acc[userEmail].responseRate =
				acc[userEmail].applications > 0 ? ((acc[userEmail].interviews + acc[userEmail].offers) / acc[userEmail].applications) * 100 : 0;

			return acc;
		},
		{} as Record<string, { applications: number; interviews: number; offers: number; successRate: number; responseRate: number }>,
	);

	const topPerformers = Object.entries(userMetrics)
		.sort(([, a], [, b]) => b.successRate - a.successRate)
		.slice(0, 5);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Analytics Filter */}
			<div className="flex items-center gap-4">
				<Title as="h3">Advanced Analytics</Title>
				<Select value={analyticsFilter} onValueChange={setAnalyticsFilter}>
					<SelectTrigger className="w-48">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="overview">Overview</SelectItem>
						<SelectItem value="trends">Trends Analysis</SelectItem>
						<SelectItem value="performance">Performance</SelectItem>
						<SelectItem value="companies">Company Analysis</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Key Performance Indicators */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{applications.length > 0 ? ((funnelData.offered / applications.length) * 100).toFixed(1) : 0}%</div>
						<p className="text-xs text-muted-foreground">Application to offer</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{applications.length > 0 ? (((funnelData.interviewing + funnelData.offered) / applications.length) * 100).toFixed(1) : 0}%
						</div>
						<p className="text-xs text-muted-foreground">Applications to interviews</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Avg Applications/User</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{Object.keys(userMetrics).length > 0 ? (applications.length / Object.keys(userMetrics).length).toFixed(1) : 0}
						</div>
						<p className="text-xs text-muted-foreground">Per active user</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Top Company Success</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{topCompanies.length > 0 ? topCompanies[0][1].successRate.toFixed(1) : 0}%</div>
						<p className="text-xs text-muted-foreground">{topCompanies.length > 0 ? topCompanies[0][0] : "No data"}</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts based on selected filter */}
			{analyticsFilter === "overview" && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Activity Timeline</CardTitle>
						</CardHeader>
						<CardContent>
							<Chart type="line" series={timeSeriesChart.series} height={300} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Success Funnel</CardTitle>
						</CardHeader>
						<CardContent>
							<Chart type="bar" series={funnelChart.series} height={300} />
						</CardContent>
					</Card>
				</div>
			)}

			{analyticsFilter === "trends" && (
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>12-Month Trends</CardTitle>
						</CardHeader>
						<CardContent>
							<Chart type="line" series={monthlyChart.series} height={400} />
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Growth Metrics</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm">Monthly Application Growth</span>
									<span className="font-medium">+12.5%</span>
								</div>
								<Progress value={75} className="h-2" />

								<div className="flex justify-between items-center">
									<span className="text-sm">Interview Conversion</span>
									<span className="font-medium">+8.3%</span>
								</div>
								<Progress value={60} className="h-2" />

								<div className="flex justify-between items-center">
									<span className="text-sm">Success Rate Improvement</span>
									<span className="font-medium">+15.7%</span>
								</div>
								<Progress value={85} className="h-2" />
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Seasonal Patterns</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-sm">Peak Application Period</span>
										<Badge variant="secondary">September</Badge>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm">Best Success Rate</span>
										<Badge variant="secondary">June</Badge>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm">Most Interviews</span>
										<Badge variant="secondary">October</Badge>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			)}

			{analyticsFilter === "performance" && (
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Top Performing Users</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{topPerformers.map(([email, metrics], index) => (
									<div key={email} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">{index + 1}</div>
											<div>
												<div className="font-medium">{email}</div>
												<div className="text-sm text-muted-foreground">
													{metrics.applications} applications • {metrics.offers} offers
												</div>
											</div>
										</div>
										<div className="text-right">
											<div className="font-medium">{metrics.successRate.toFixed(1)}%</div>
											<div className="text-sm text-muted-foreground">success rate</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{analyticsFilter === "companies" && (
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Company Performance Analysis</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{topCompanies.map(([company, stats]) => (
									<div key={company} className="p-4 border rounded-lg">
										<div className="flex justify-between items-start mb-3">
											<div>
												<div className="font-medium">{company}</div>
												<div className="text-sm text-muted-foreground">{stats.total} total applications</div>
											</div>
											<Badge variant="secondary">{stats.successRate.toFixed(1)}% success</Badge>
										</div>
										<div className="grid grid-cols-3 gap-4 text-sm">
											<div>
												<div className="text-muted-foreground">Interviews</div>
												<div className="font-medium">{stats.interviews}</div>
											</div>
											<div>
												<div className="text-muted-foreground">Offers</div>
												<div className="font-medium">{stats.offers}</div>
											</div>
											<div>
												<div className="text-muted-foreground">Rejections</div>
												<div className="font-medium">{stats.rejections}</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
