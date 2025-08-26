import proposalService from "@/api/services/proposalService";
import type { ProposalInfo } from "@/types/entity";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateProposal = () => {
	const updateProposalMutation = useMutation({
		mutationFn: proposalService.createAndUpdateProposal,
		onSuccess: (res) => {
			toast.success("Proposal updated successfully.", {
				closeButton: true,
			});
		},
		onError: (err) => {
			toast.error(`Error update proposal: ${err.message}`, {
				position: "top-center",
			});
		},
	});

	const updateProposal = async (proposal: Partial<ProposalInfo>) => await updateProposalMutation.mutateAsync(proposal);
	return { updateProposal, isLoading: updateProposalMutation.isPending };
};

export const useGetProposalList = (filters?: { userId?: string; profileId?: string; page?: number; limit?: number; status?: string; company?: string }) => {
	const query = useQuery({
		queryKey: ["proposals", filters],
		queryFn: () => proposalService.getProposalList(filters),
		enabled: true, // Always enabled, but you can add conditions here if needed
		staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
		refetchOnWindowFocus: false, // Don't refetch when window gains focus
		// Error handling moved to component level
	});

	return {
		getProposalList: query.refetch,
		isLoading: query.isLoading,
		data: query.data,
		error: query.error,
	};
};

export const useDeleteProposal = () => {
	const deleteProposalMutation = useMutation({
		mutationFn: proposalService.deleteProposal,
		onSuccess: (res) => {
			toast.success("Proposal deleted successfully.", {
				closeButton: true,
			});
		},
		onError: (err) => {
			toast.error(`Error deleting proposal: ${err.message}`, {
				position: "top-center",
			});
		},
	});

	const deleteProposal = async (proposalId?: string, proposalIds?: string[]) => await deleteProposalMutation.mutateAsync({ proposalId, proposalIds });
	return { deleteProposal, isLoading: deleteProposalMutation.isPending };
};
