import { useUserActions, useUserToken } from "@/store/userStore";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export const useTokenValidation = () => {
	const { access_token } = useUserToken();
	const { clearUserInfoAndToken } = useUserActions();
	const navigate = useNavigate();
	const hasRedirected = useRef(false);

	useEffect(() => {
		// Prevent infinite loops by checking if we've already redirected
		if (hasRedirected.current) {
			return;
		}

		if (!access_token) {
			hasRedirected.current = true;
			// Clear any existing tokens from localStorage
			localStorage.removeItem("userStore");
			navigate("/auth/login", { replace: true });
			return;
		}

		// Check if token is expired
		try {
			const payload = JSON.parse(atob(access_token.split(".")[1]));
			const currentTime = Math.floor(Date.now() / 1000);

			if (payload.exp < currentTime) {
				// Token is expired
				hasRedirected.current = true;
				clearUserInfoAndToken();
				localStorage.removeItem("userStore");
				toast.error("Session expired. Please login again.", {
					position: "top-center",
				});
				navigate("/auth/login", { replace: true });
			}
		} catch (error) {
			console.error("Error validating token:", error);
			// Invalid token format, clear and redirect
			hasRedirected.current = true;
			clearUserInfoAndToken();
			localStorage.removeItem("userStore");
			navigate("/auth/login", { replace: true });
		}
	}, [access_token, clearUserInfoAndToken, navigate]);

	return { access_token };
};
