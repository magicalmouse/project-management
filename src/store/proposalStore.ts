import proposalService from "@/api/services/proposalService";
import { ProposalInfo } from "@/types/entity";
import { useMutation } from "@tanstack/react-query";
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
		}
	});

	const updateProposal = async (proposal: Partial<ProposalInfo>) => await updateProposalMutation.mutateAsync(proposal);
	return { updateProposal, isLoading: updateProposalMutation.isPending }
}

export const useGetProposalList = () => {
    const getProposalListMutation = useMutation({
      mutationFn: proposalService.getProposalList,
      onSuccess: (res) => {
      },
      onError: (err) => {
        toast.error(`Error fetching proposal: ${err.message}`, {
          position: "top-center",
        });
      }
    });

    const getProposalList = async (userId: string, profileId?: string) => await getProposalListMutation.mutateAsync({userId, profileId});
    return { getProposalList, isLoading: getProposalListMutation.isPending};
}

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
      }
    });

    const deleteProposal = async (proposalId?: string, proposalIds?: string[]) => await deleteProposalMutation.mutateAsync({proposalId, proposalIds});
    return { deleteProposal, isLoading: deleteProposalMutation.isPending};
}