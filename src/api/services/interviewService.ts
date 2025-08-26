import type { InterviewInfo } from "@/types/entity";
import apiClient from "../apiClient";

interface ApiResponse {
	success: boolean;
	error?: string;
	[key: string]: any;
}

const createAndUpdateInterview = async (interview: Partial<InterviewInfo>, token: string) => {
	try {
		const method = interview.id ? "put" : "post";
		const url = interview.id ? `/interviews/${interview.id}` : "/interviews";

		const data = {
			proposal: typeof interview.proposal === "string" ? interview.proposal : interview.proposal?.id,
			profile: typeof interview.profile === "string" ? interview.profile : interview.profile?.id,
			meetingTitle: interview.meeting_title,
			meetingDate: interview.meeting_date,
			meetingLink: interview.meeting_link,
			interviewer: interview.interviewer,
			progress: interview.progress,
			jobDescription: interview.job_description,
			notes: interview.notes,
			feedback: interview.feedback,
			selectedResumeId: interview.selected_resume_id,
			resumeLink: interview.resume_link,
		};

		const response = await apiClient[method]<ApiResponse>({
			url,
			headers: {
				Authorization: `Bearer ${token}`,
			},
			data,
		});

		if (response.success) {
			console.log("Interview saved:", response.interview);
			return { id: response.interview.id };
		}

		throw new Error("Failed to save interview");
	} catch (error: any) {
		console.error("Save interview error:", error);
		throw new Error(error.response?.data?.error || error.message || "Failed to save interview");
	}
};

const getInterviewList = async (
	token: string,
	filters?: { profile?: string; user?: string; proposal?: string; page?: number; limit?: number; startDate?: string; endDate?: string },
) => {
	try {
		const params = new URLSearchParams();
		if (filters?.page) params.append("page", filters.page.toString());
		if (filters?.limit) params.append("limit", filters.limit.toString());
		if (filters?.profile) params.append("profile", filters.profile);
		if (filters?.user) params.append("user", filters.user);
		if (filters?.proposal) params.append("proposal", filters.proposal);
		if (filters?.startDate) params.append("startDate", filters.startDate);
		if (filters?.endDate) params.append("endDate", filters.endDate);

		const url = `/interviews${params.toString() ? `?${params.toString()}` : ""}`;

		const response = await apiClient.get<ApiResponse>({
			url,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (response.success) {
			// Transform backend response to match frontend format
			const transformedInterviews = response.interviews.map((interview: any) => ({
				id: interview.id,
				proposal: interview.proposal,
				user: interview.user,
				profile: interview.profile,
				meeting_title: interview.meetingTitle,
				meeting_date: interview.meetingDate,
				meeting_link: interview.meetingLink,
				interviewer: interview.interviewer,
				progress: interview.progress,
				job_description: interview.jobDescription,
				notes: interview.notes,
				feedback: interview.feedback,
				selected_resume_id: interview.selectedResumeId,
				resume_link: interview.resumeLink,
				created_at: interview.createdAt,
				updated_at: interview.updatedAt,
				userInfo: interview.userInfo,
				proposalInfo: interview.proposalInfo,
			}));

			console.log("Fetched interview data:", transformedInterviews);
			return {
				interviews: transformedInterviews,
				pagination: response.pagination,
			};
		}

		throw new Error("Failed to fetch interviews");
	} catch (error: any) {
		console.error("Get interviews error:", error);
		throw new Error(error.response?.data?.error || error.message || "Failed to fetch interviews");
	}
};

const getScheduledResume = async (interviewId: string, token: string) => {
	try {
		const response = await apiClient.get<ApiResponse>({
			url: `/interviews/${interviewId}/scheduled-resume`,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (response.success) {
			return response.scheduledResume;
		}

		throw new Error("Failed to fetch scheduled resume");
	} catch (error: any) {
		console.error("Get scheduled resume error:", error);
		throw new Error(error.response?.data?.error || error.message || "Failed to fetch scheduled resume");
	}
};

const getInterviewById = async (interviewId: string, token: string) => {
	try {
		const response = await apiClient.get<ApiResponse>({
			url: `/interviews/${interviewId}`,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (response.success) {
			// Transform backend response to match frontend format
			const interview = {
				id: response.interview.id,
				proposal: response.interview.proposal,
				user: response.interview.user,
				profile: response.interview.profile,
				meeting_title: response.interview.meetingTitle,
				meeting_date: response.interview.meetingDate,
				meeting_link: response.interview.meetingLink,
				interviewer: response.interview.interviewer,
				progress: response.interview.progress,
				job_description: response.interview.jobDescription,
				notes: response.interview.notes,
				feedback: response.interview.feedback,
				created_at: response.interview.createdAt,
				updated_at: response.interview.updatedAt,
				userInfo: response.interview.userInfo,
				proposalInfo: response.interview.proposalInfo,
			};

			console.log("Fetched interview:", interview);
			return interview;
		}

		throw new Error("Failed to fetch interview");
	} catch (error: any) {
		console.error("Get interview error:", error);
		throw new Error(error.response?.data?.error || error.message || "Failed to fetch interview");
	}
};

const deleteInterview = async (interviewId: string, token: string) => {
	try {
		const response = await apiClient.delete<ApiResponse>({
			url: `/interviews/${interviewId}`,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (response.success) {
			console.log("Deleted interview:", interviewId);
			return { deletedId: interviewId };
		}

		throw new Error("Failed to delete interview");
	} catch (error: any) {
		console.error("Delete interview error:", error);
		throw new Error(error.response?.data?.error || error.message || "Failed to delete interview");
	}
};

export default {
	createAndUpdateInterview,
	getInterviewList,
	getInterviewById,
	deleteInterview,
	getScheduledResume,
};
