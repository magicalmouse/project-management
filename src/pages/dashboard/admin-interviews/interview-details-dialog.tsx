import type { InterviewInfo } from "@/types/entity";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Text, Title } from "@/ui/typography";
import { Calendar, Clock, ExternalLink, FileText, User, Video } from "lucide-react";

interface InterviewDetailsDialogProps {
	interview: InterviewInfo | null;
	show: boolean;
	onClose: () => void;
	accessToken?: string;
}

export default function InterviewDetailsDialog({ interview, show, onClose, accessToken }: InterviewDetailsDialogProps) {
	if (!interview) return null;

	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return "Not specified";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatTime = (dateString: string | undefined) => {
		if (!dateString) return "Not specified";
		return new Date(dateString).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getProgressBadgeVariant = (progress: any) => {
		const progressValue = typeof progress === "number" ? (progress === 0 ? "scheduled" : progress === 1 ? "completed" : "cancelled") : progress;

		switch (progressValue) {
			case "completed":
				return "default";
			case "scheduled":
				return "secondary";
			case "cancelled":
				return "destructive";
			default:
				return "outline";
		}
	};

	const getProgressDisplay = (progress: any) => {
		if (typeof progress === "number") {
			switch (progress) {
				case 0:
					return "scheduled";
				case 1:
					return "completed";
				case 2:
					return "cancelled";
				default:
					return "unknown";
			}
		}
		return progress || "unknown";
	};

	return (
		<Dialog open={show} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-[1200px] w-[95vw] max-h-[95vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Video className="h-5 w-5" />
						Interview Details
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Header Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5 text-blue-600" />
								{interview.meeting_title || "Untitled Interview"}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center gap-2">
									<User className="h-4 w-4 text-gray-500" />
									<div>
										<Text className="text-sm font-medium">Candidate</Text>
										<Text className="text-sm text-gray-600">
											{typeof interview.user === "string" ? interview.user : interview.user?.email || "Unknown User"}
										</Text>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<User className="h-4 w-4 text-gray-500" />
									<div>
										<Text className="text-sm font-medium">Interviewer</Text>
										<Text className="text-sm text-gray-600">{interview.interviewer || "Not assigned"}</Text>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-gray-500" />
									<div>
										<Text className="text-sm font-medium">Date</Text>
										<Text className="text-sm text-gray-600">{formatDate(interview.meeting_date)}</Text>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-gray-500" />
									<div>
										<Text className="text-sm font-medium">Time</Text>
										<Text className="text-sm text-gray-600">{formatTime(interview.meeting_date)}</Text>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Badge variant={getProgressBadgeVariant(interview.progress)}>{getProgressDisplay(interview.progress)}</Badge>
								</div>
								{interview.meeting_link && (
									<div className="flex items-center gap-2">
										<Video className="h-4 w-4 text-gray-500" />
										<div>
											<Text className="text-sm font-medium">Meeting Link</Text>
											<a
												href={interview.meeting_link}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
											>
												Join Meeting
												<ExternalLink className="h-3 w-3" />
											</a>
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Job Description */}
					{interview.job_description && (
						<Card>
							<CardHeader>
								<CardTitle>Job Description</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
									<Text className="text-sm leading-relaxed whitespace-pre-wrap font-normal">{interview.job_description}</Text>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Notes */}
					{interview.notes && (
						<Card>
							<CardHeader>
								<CardTitle>Notes</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
									<Text className="text-sm leading-relaxed whitespace-pre-wrap font-normal">{interview.notes}</Text>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Feedback */}
					{interview.feedback && (
						<Card>
							<CardHeader>
								<CardTitle>Feedback</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
									<Text className="text-sm leading-relaxed whitespace-pre-wrap font-normal">{interview.feedback}</Text>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Resume Information */}
					{interview.resume_link && (
						<Card>
							<CardHeader>
								<CardTitle>Resume Information</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-2">
									<FileText className="h-4 w-4 text-gray-500" />
									<div>
										<Text className="text-sm font-medium">Resume</Text>
										<Button
											variant="link"
											size="sm"
											className="h-auto p-0 text-blue-600 hover:text-blue-800"
											onClick={() => {
												if (accessToken && interview.resume_link) {
													// Create a URL with the interview data and access token
													const viewerUrl = new URL("/resume-viewer", window.location.origin);
													viewerUrl.searchParams.set("token", accessToken);
													viewerUrl.searchParams.set("interviewId", interview.id);
													viewerUrl.searchParams.set("resumeLink", interview.resume_link);
													viewerUrl.searchParams.set("meetingTitle", interview.meeting_title || "");
													viewerUrl.searchParams.set("user", typeof interview.user === "string" ? interview.user : interview.user?.email || "");
													viewerUrl.searchParams.set("interviewer", interview.interviewer || "");
													viewerUrl.searchParams.set("meetingDate", interview.meeting_date || "");

													// Open the resume viewer page in a new tab
													const newWindow = window.open(viewerUrl.toString(), "_blank", "noopener,noreferrer,scrollbars=yes,resizable=yes");

													if (newWindow) {
														newWindow.focus();
													}
												} else {
													console.error("Access token not available for resume viewing");
													alert("Unable to access resume. Please try again.");
												}
											}}
										>
											View Resume
											<ExternalLink className="h-3 w-3 ml-1" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Additional Information */}
					<Card>
						<CardHeader>
							<CardTitle>Additional Information</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<Text className="font-medium">Interview ID</Text>
									<Text className="text-gray-600 font-mono">{interview.id}</Text>
								</div>
								<div>
									<Text className="font-medium">Proposal ID</Text>
									<Text className="text-gray-600">
										{typeof interview.proposal === "string" ? interview.proposal : interview.proposal?.id || "Not specified"}
									</Text>
								</div>
								<div>
									<Text className="font-medium">Profile ID</Text>
									<Text className="text-gray-600">{typeof interview.profile === "string" ? interview.profile : interview.profile?.id || "Not specified"}</Text>
								</div>
								<div>
									<Text className="font-medium">Selected Resume ID</Text>
									<Text className="text-gray-600">{interview.selected_resume_id || "Not specified"}</Text>
								</div>
								<div>
									<Text className="font-medium">Created</Text>
									<Text className="text-gray-600">{formatDate(interview.created_at)}</Text>
								</div>
								<div>
									<Text className="font-medium">Last Updated</Text>
									<Text className="text-gray-600">{formatDate(interview.created_at)}</Text>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="flex justify-end gap-2 pt-4 border-t">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
