import interviewService from "@/api/services/interviewService";
import { InterviewInfo } from "@/types/entity";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateInterview = () => {
	const updateInterviewMutation = useMutation({
		mutationFn: interviewService.createAndUpdateInterview,
		onSuccess: (res) => {
			toast.success("Interview updated successfully.", {
				closeButton: true,
			});
		},
		onError: (err) => {
			toast.error(`Error update interview: ${err.message}`, {
				position: "top-center",
			});
		}
	});

	const updateInterview = async (interview: Partial<InterviewInfo>) => await updateInterviewMutation.mutateAsync(interview);
	return { updateInterview, isLoading: updateInterviewMutation.isPending }
}

export const useGetInterviewList = () => {
    const getInterviewListMutation = useMutation({
      mutationFn: interviewService.getInterviewList,
      onSuccess: (res) => {
      },
      onError: (err) => {
        toast.error(`Error fetching interview: ${err.message}`, {
          position: "top-center",
        });
      }
    });

    const getInterviewList = async (profile?: string, user?: string) => await getInterviewListMutation.mutateAsync({profile, user});
    return { getInterviewList, isLoading: getInterviewListMutation.isPending};
}

export const useDeleteInterview = () => {
    const deleteInterviewMutation = useMutation({
      mutationFn: interviewService.deleteInterview,
      onSuccess: (res) => {
        toast.success("Interview deleted successfully.", {
				  closeButton: true,
			  });
      },
      onError: (err) => {
        toast.error(`Error deleting interview: ${err.message}`, {
          position: "top-center",
        });
      }
    });

    const deleteInterview = async (interviewId: string) => await deleteInterviewMutation.mutateAsync(interviewId);
    return { deleteInterview, isLoading: deleteInterviewMutation.isPending};
}