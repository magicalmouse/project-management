import profileService from "@/api/services/profileService";
import { ProfileInfo } from "@/types/entity";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ProfileInfoRequest {
  id?: string;
  name: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  job_sites: string;
  country: string;
  user?: string;
}

export const useUpdateProfile = () => {
	const updateProfileMutation = useMutation({
		mutationFn: profileService.createAndUpdateProfile,
		onSuccess: (res) => {
			toast.success("Profile updated successfully.", {
				closeButton: true,
			});
		},
		onError: (err) => {
			toast.error(`Error update profile: ${err.message}`, {
				position: "top-center",
			});
		}
	});

	const updateProfile = async (profile: Partial<ProfileInfo>) => await updateProfileMutation.mutateAsync(profile);
	return { updateProfile, isLoading: updateProfileMutation.isPending }
}

export const useGetProfileList = () => {
    const getProfileListMutation = useMutation({
      mutationFn: profileService.getProfileList,
      onSuccess: (res) => {
      },
      onError: (err) => {
        toast.error(`Error fetching profile: ${err.message}`, {
          position: "top-center",
        });
      }
    });

    const getProfileList = async (userId?: string) => await getProfileListMutation.mutateAsync(userId);
    return { getProfileList, isLoading: getProfileListMutation.isPending};
}

export const useDeleteProfile = () => {
    const deleteProfileMutation = useMutation({
      mutationFn: profileService.deleteProfile,
      onSuccess: (res) => {
        toast.success("Profile deleted successfully.", {
				  closeButton: true,
			  });
      },
      onError: (err) => {
        toast.error(`Error deleting profile: ${err.message}`, {
          position: "top-center",
        });
      }
    });

    const deleteProfile = async (profileId: string) => await deleteProfileMutation.mutateAsync(profileId);
    return { deleteProfile, isLoading: deleteProfileMutation.isPending};
}