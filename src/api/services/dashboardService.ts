import type { InterviewInfo, ProposalInfo } from "@/types/entity";
import apiClient from "../apiClient";

export interface DashboardStats {
	totalApplications: number;
	totalInterviews: number;
	applicationsThisMonth: number;
	interviewsThisMonth: number;
	applicationsThisWeek: number;
	interviewsThisWeek: number;
	applicationsToday: number;
	interviewsToday: number;
	applicationTrend: number;
	interviewTrend: number;
	recentApplications: ProposalInfo[];
	upcomingInterviews: InterviewInfo[];
	applicationsByStatus: {
		applied: number;
		interviewing: number;
		offered: number;
		rejected: number;
		cancelled: number;
	};
	interviewsByProgress: {
		scheduled: number;
		completed: number;
		cancelled: number;
	};
	// Admin-specific analytics
	totalUsers?: number;
	activeUsers?: number;
	newUsersThisMonth?: number;
	averageApplicationsPerUser?: number;
	successRate?: number;
	responseRate?: number;
	conversionRate?: number;
	topCompanies?: Array<{ company: string; count: number }> | null;
	applicationTrends?: Array<{ date: string; applications: number; interviews: number }> | null;
	monthlyTrends?: Array<{ label: string; applications: number; interviews: number }> | null;
	trendData?: Array<{ label: string; applications: number; interviews: number }> | null;
	trendLabels?: string[] | null;
	hasRealData?: boolean;
}

interface ApiResponse {
	success: boolean;
	error?: string;
	[key: string]: any;
}

const getDashboardStats = async (userId?: string, token?: string, timePeriod = "month"): Promise<DashboardStats> => {
	try {
		console.log("🔍 Fetching dashboard stats from backend API...");
		console.log("🔍 Calling dashboard API with period:", timePeriod);

		// Use the backend dashboard endpoint with time period parameter
		// Note: apiClient automatically adds Authorization header from userStore
		const response = await apiClient.get<ApiResponse>({
			url: `/dashboard/stats?period=${timePeriod}`,
		});

		// Backend returns data directly without success wrapper
		if (!response || typeof response !== "object") {
			throw new Error("Invalid response format from dashboard API");
		}

		console.log("✅ Dashboard stats fetched successfully from backend");
		console.log("📊 Backend Stats:", response);

		// Transform backend response to match frontend interface
		const transformedStats: DashboardStats = {
			totalApplications: response.totalApplications || 0,
			totalInterviews: response.totalInterviews || 0,
			applicationsThisMonth: response.applicationsThisMonth || 0,
			interviewsThisMonth: response.interviewsThisMonth || 0,
			applicationsThisWeek: response.applicationsThisWeek || 0,
			interviewsThisWeek: response.interviewsThisWeek || 0,
			applicationsToday: response.applicationsToday || 0,
			interviewsToday: response.interviewsToday || 0,
			applicationTrend: response.applicationTrend || 0,
			interviewTrend: response.interviewTrend || 0,
			recentApplications: response.recentApplications || [],
			upcomingInterviews: response.upcomingInterviews || [],
			applicationsByStatus: response.applicationsByStatus || {
				applied: 0,
				interviewing: 0,
				offered: 0,
				rejected: 0,
				cancelled: 0,
			},
			interviewsByProgress: response.interviewsByProgress || {
				scheduled: 0,
				completed: 0,
				cancelled: 0,
			},
			// Admin-specific stats
			totalUsers: response.totalUsers || 0,
			activeUsers: response.activeUsers || 0,
			newUsersThisMonth: response.newUsersThisMonth || 0,
			averageApplicationsPerUser: response.averageApplicationsPerUser || 0,
			successRate: response.successRate || 0,
			responseRate: response.responseRate || 0,
			conversionRate: response.conversionRate || 0,
			topCompanies: response.topCompanies || [],
			applicationTrends: response.applicationTrends || [],
			monthlyTrends: response.monthlyTrends || [],
			trendData: response.trendData || [],
			trendLabels: response.trendLabels || [],
			hasRealData: response.hasRealData || false,
		};

		return transformedStats;
	} catch (error: any) {
		console.error("❌ Failed to fetch dashboard stats:", error.message);

		// Return empty stats when API fails
		return {
			totalApplications: 0,
			totalInterviews: 0,
			applicationsThisMonth: 0,
			interviewsThisMonth: 0,
			applicationsThisWeek: 0,
			interviewsThisWeek: 0,
			applicationsToday: 0,
			interviewsToday: 0,
			applicationTrend: 0,
			interviewTrend: 0,
			recentApplications: [],
			upcomingInterviews: [],
			applicationsByStatus: {
				applied: 0,
				interviewing: 0,
				offered: 0,
				rejected: 0,
				cancelled: 0,
			},
			interviewsByProgress: {
				scheduled: 0,
				completed: 0,
				cancelled: 0,
			},
			totalUsers: 0,
			activeUsers: 0,
			newUsersThisMonth: 0,
			averageApplicationsPerUser: 0,
			successRate: 0,
			responseRate: 0,
			conversionRate: 0,
			topCompanies: [],
			applicationTrends: [],
			monthlyTrends: [],
			trendData: [],
			trendLabels: [],
			hasRealData: false,
		};
	}
};

export default {
	getDashboardStats,
};
