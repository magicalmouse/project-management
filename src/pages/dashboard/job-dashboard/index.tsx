import dashboardService, { type DashboardStats } from "@/api/services/dashboardService";
import { useAuth } from "@/components/auth/use-auth";
import Icon from "@/components/icon/icon";
import InterviewModal, { type InterviewModalProps } from "@/pages/management/user/interview/detail/interview-modal";
import SimpleJobApplicationModal, { type SimpleJobApplicationModalProps } from "@/pages/user/project-list/simple-job-application-modal";
import { useRouter } from "@/routes/hooks";
import userStore from "@/store/userStore";
import type { InterviewInfo, ProposalInfo } from "@/types/entity";
import { InterviewProgress } from "@/types/enum";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { ModernButton } from "@/ui/modern-button";
import { ModernCard } from "@/ui/modern-card";
import { ModernStatsCard } from "@/ui/modern-stats-card";
import { Text, Title } from "@/ui/typography";
import { m } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import PersonalTrendsChart from "./personal-trends-chart";

// Modern Statistic Card Component
function ModernStatCard({
	title,
	value,
	trend,
	icon,
	iconColor,
	description,
	onClick,
	colorScheme = "blue",
}: {
	title: string;
	value: number;
	trend?: string;
	icon: string;
	iconColor: string;
	description?: string;
	onClick?: () => void;
	colorScheme?: "blue" | "green" | "orange" | "purple" | "red" | "gray";
}) {
	const colorClasses = {
		blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
		green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
		orange: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20",
		purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
		red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
		gray: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20",
	};

	return (
		<m.div whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
			<ModernCard className={`p-6 ${onClick ? "cursor-pointer" : ""}`} onClick={onClick} hoverable>
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-3">
						<m.div
							initial={{ scale: 0, rotate: -180 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{ type: "spring", stiffness: 300, damping: 20 }}
							className={`p-3 rounded-xl ${colorClasses[colorScheme]}`}
						>
							<Icon icon={icon} size={24} />
						</m.div>
						<div>
							<Text variant="body2" className="text-muted-foreground">
								{title}
							</Text>
							<Title as="h3" className="text-2xl font-bold">
								{value}
							</Title>
						</div>
					</div>
					{onClick && (
						<m.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
							<Icon icon="mdi:arrow-right" size={20} className="text-muted-foreground" />
						</m.div>
					)}
				</div>
				{trend && (
					<m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-2">
						<Icon icon="mdi:trending-up" size={16} color="#10b981" />
						<Text variant="body2" className="text-muted-foreground">
							{trend}
						</Text>
					</m.div>
				)}
				{description && (
					<Text variant="body2" className="text-muted-foreground mt-1">
						{description}
					</Text>
				)}
			</ModernCard>
		</m.div>
	);
}

// Modern Quick Action Card Component
function ModernQuickActionCard({
	title,
	description,
	icon,
	iconColor,
	onClick,
	colorScheme = "blue",
}: {
	title: string;
	description: string;
	icon: string;
	iconColor: string;
	onClick: () => void;
	colorScheme?: "blue" | "green" | "orange" | "purple" | "red" | "gray";
}) {
	const colorClasses = {
		blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
		green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
		orange: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20",
		purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
		red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
		gray: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20",
	};

	return (
		<m.div whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
			<ModernCard className="p-6 cursor-pointer" onClick={onClick} hoverable>
				<div className="flex items-center gap-4">
					<m.div
						initial={{ scale: 0, rotate: -180 }}
						animate={{ scale: 1, rotate: 0 }}
						transition={{ type: "spring", stiffness: 300, damping: 20 }}
						className={`p-3 rounded-xl ${colorClasses[colorScheme]}`}
					>
						<Icon icon={icon} size={24} />
					</m.div>
					<div className="flex-1">
						<Title as="h3" className="text-lg font-semibold mb-1">
							{title}
						</Title>
						<Text variant="body2" className="text-muted-foreground">
							{description}
						</Text>
					</div>
					<m.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
						<Icon icon="mdi:arrow-right" size={20} className="text-muted-foreground" />
					</m.div>
				</div>
			</ModernCard>
		</m.div>
	);
}

const defaultProposalValue: ProposalInfo = {
	id: "",
	user: "",
	profile: "",
	job_description: "",
	company: "",
	job_link: "",
	cover_letter: "",
	status: "applied",
};

const defaultInterviewValue: InterviewInfo = {
	id: "",
	user: "",
	profile: "",
	meeting_title: "",
	meeting_date: "",
	meeting_link: "",
	job_description: "",
	interviewer: "",
	progress: InterviewProgress.PENDING,
};

export default function JobDashboard() {
	const { user } = useAuth();
	const { push } = useRouter();
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [timePeriod, setTimePeriod] = useState<string>("month");
	const [simpleModalProps, setSimpleModalProps] = useState<SimpleJobApplicationModalProps>({
		formValue: { ...defaultProposalValue },
		title: "New Job Application",
		show: false,
		onOk: (values) => {
			setSimpleModalProps((prev) => ({ ...prev, show: false }));
			// Refresh the dashboard data
			fetchDashboardData();
		},
		onCancel: () => {
			setSimpleModalProps((prev) => ({ ...prev, show: false }));
		},
	});
	const [interviewModalProps, setInterviewModalProps] = useState<InterviewModalProps>({
		formValue: { ...defaultInterviewValue },
		title: "Schedule Interview",
		show: false,
		onOk: (values) => {
			setInterviewModalProps((prev) => ({ ...prev, show: false }));
			// Refresh the dashboard data
			fetchDashboardData();
		},
		onCancel: () => {
			setInterviewModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	const fetchDashboardData = useCallback(async () => {
		if (!user?.id) return;

		try {
			setLoading(true);
			// Get the auth token from the store
			const userState = userStore.getState();
			const token = userState.userToken?.access_token;

			const dashboardData = await dashboardService.getDashboardStats(user.id, token, timePeriod);
			setStats(dashboardData);
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
		} finally {
			setLoading(false);
		}
	}, [user?.id, timePeriod]);

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	const handleTimePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setTimePeriod(event.target.value);
	};

	const handleNewJobApplication = () => {
		setSimpleModalProps((prev) => ({
			...prev,
			formValue: {
				...defaultProposalValue,
				user: user?.id || "",
				profile: user?.id || "", // Assuming profile is same as user for now
			},
			title: "New Job Application",
			show: true,
		}));
	};

	const handleScheduleInterview = () => {
		setInterviewModalProps((prev) => ({
			...prev,
			formValue: {
				...defaultInterviewValue,
				user: user?.id || "",
				profile: user?.id || "", // Assuming profile is same as user for now
			},
			title: "Schedule Interview",
			show: true,
		}));
	};

	if (loading) {
		return (
			<m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-64">
				<ModernCard className="text-center space-y-6 p-8">
					<m.div
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
						className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto"
					/>
					<div>
						<Title as="h3" className="mb-2">
							Loading Dashboard
						</Title>
						<Text className="text-muted-foreground">Fetching your latest data...</Text>
					</div>
				</ModernCard>
			</m.div>
		);
	}

	const currentDate = new Date();
	const formattedDate = currentDate.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const formattedTime = currentDate.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
			{/* Header */}
			<m.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
			>
				<div className="space-y-2">
					<div className="flex items-center gap-3">
						<m.div
							initial={{ scale: 0, rotate: -180 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{ type: "spring", stiffness: 300, damping: 20 }}
							className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400"
						>
							<Icon icon="mdi:briefcase" className="h-6 w-6" />
						</m.div>
						<div>
							<Title
								as="h1"
								className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
							>
								My Job Dashboard
							</Title>
							<Text className="text-muted-foreground mt-1">Track your job applications and interview progress</Text>
						</div>
					</div>
				</div>
				<m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
					<div className="flex items-center gap-2">
						<Text variant="body2" className="text-muted-foreground">
							Time Period:
						</Text>
						<select
							value={timePeriod}
							onChange={handleTimePeriodChange}
							className="border-2 hover:border-primary/20 transition-colors rounded-lg px-3 py-2 bg-white dark:bg-gray-900"
						>
							<option value="today">Today</option>
							<option value="week">This Week</option>
							<option value="month">This Month</option>
							<option value="all">All Time</option>
						</select>
					</div>
				</m.div>
			</m.div>

			{/* Key Statistics */}
			<m.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3, duration: 0.5 }}
				className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
			>
				<ModernStatsCard
					title="My Applications"
					value={stats?.totalApplications || 0}
					icon={<Icon icon="mdi:briefcase" className="h-6 w-6" />}
					colorScheme="blue"
					change={{
						value: stats?.applicationTrend || 0,
						type: (stats?.applicationTrend || 0) >= 0 ? "increase" : "decrease",
					}}
				/>
				<ModernStatsCard
					title="My Interviews"
					value={stats?.totalInterviews || 0}
					icon={<Icon icon="mdi:calendar" className="h-6 w-6" />}
					colorScheme="green"
					change={{
						value: stats?.interviewTrend || 0,
						type: (stats?.interviewTrend || 0) >= 0 ? "increase" : "decrease",
					}}
				/>
				<ModernStatsCard
					title="Response Rate"
					value={stats?.responseRate || 0}
					icon={<Icon icon="mdi:percent" className="h-6 w-6" />}
					colorScheme="purple"
					change={
						stats?.responseRate && stats.responseRate > 0
							? {
									value: 0,
									type: "increase",
								}
							: undefined
					}
				/>
				<ModernStatsCard
					title="Avg Response Time"
					value={stats?.averageApplicationsPerUser || 0}
					icon={<Icon icon="mdi:clock" className="h-6 w-6" />}
					colorScheme="orange"
					change={
						stats?.averageApplicationsPerUser && stats.averageApplicationsPerUser > 0
							? {
									value: 0,
									type: "decrease",
								}
							: undefined
					}
				/>
			</m.div>

			{/* Charts Row */}
			<m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="grid gap-6 md:grid-cols-2">
				<PersonalTrendsChart monthlyTrends={stats?.monthlyTrends || []} loading={loading} timePeriod={timePeriod} />

				<ModernCard>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon icon="mdi:chart-donut" className="h-5 w-5" />
							Application Status
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="text-center">
								<Title as="h3" className="text-2xl font-bold">
									Total {stats?.totalApplications || 0}
								</Title>
							</div>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-green-500" />
										<Text>Applied</Text>
									</div>
									<Text className="font-semibold">{stats?.applicationsByStatus?.applied || 0}</Text>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-blue-500" />
										<Text>Interviewing</Text>
									</div>
									<Text className="font-semibold">{stats?.applicationsByStatus?.interviewing || 0}</Text>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-yellow-500" />
										<Text>Offered</Text>
									</div>
									<Text className="font-semibold">{stats?.applicationsByStatus?.offered || 0}</Text>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-red-500" />
										<Text>Rejected</Text>
									</div>
									<Text className="font-semibold">{stats?.applicationsByStatus?.rejected || 0}</Text>
								</div>
							</div>
						</div>
					</CardContent>
				</ModernCard>
			</m.div>

			{/* Interview Progress */}
			<m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
				<ModernCard>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon icon="mdi:progress-clock" className="h-5 w-5" />
							Interview Progress
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{[
								{ label: "Scheduled", count: stats?.interviewsByProgress?.scheduled || 0, color: "#3b82f6" },
								{ label: "Completed", count: stats?.interviewsByProgress?.completed || 0, color: "#10b981" },
								{ label: "Cancelled", count: stats?.interviewsByProgress?.cancelled || 0, color: "#ef4444" },
							].map((item, index) => (
								<m.div
									key={item.label}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.6 + index * 0.1 }}
									className="flex items-center justify-between"
								>
									<div className="flex items-center gap-3">
										<div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
										<Text className="font-medium">{item.label}</Text>
									</div>
									<div className="flex items-center gap-4">
										<Text className="font-bold">{item.count}</Text>
										<div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
											<m.div
												initial={{ width: 0 }}
												animate={{ width: `${(item.count / Math.max(1, stats?.totalInterviews || 1)) * 100}%` }}
												transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
												className="h-full rounded-full"
												style={{ backgroundColor: item.color }}
											/>
										</div>
									</div>
								</m.div>
							))}
						</div>
					</CardContent>
				</ModernCard>
			</m.div>

			{/* Quick Actions */}
			<m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
				<ModernCard>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon icon="mdi:lightning-bolt" className="h-5 w-5" />
							Quick Actions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<ModernQuickActionCard
								title="Resume Workshop"
								description="Optimize resumes for specific jobs"
								icon="mdi:file-document-edit"
								iconColor="#8b5cf6"
								colorScheme="purple"
								onClick={() => push("/resume-workshop")}
							/>
							<ModernQuickActionCard
								title="New Application"
								description="Create a new job application"
								icon="mdi:plus"
								iconColor="#3b82f6"
								colorScheme="blue"
								onClick={handleNewJobApplication}
							/>
							<ModernQuickActionCard
								title="Schedule Interview"
								description="Book a new interview session"
								icon="mdi:calendar-plus"
								iconColor="#10b981"
								colorScheme="green"
								onClick={handleScheduleInterview}
							/>
							<ModernQuickActionCard
								title="View Applications"
								description="See all your job applications"
								icon="mdi:briefcase-variant"
								iconColor="#f59e0b"
								colorScheme="orange"
								onClick={() => push("/user/project-list")}
							/>
						</div>
					</CardContent>
				</ModernCard>
			</m.div>

			{/* Modals */}
			<SimpleJobApplicationModal {...simpleModalProps} />
			<InterviewModal {...interviewModalProps} />
		</m.div>
	);
}
