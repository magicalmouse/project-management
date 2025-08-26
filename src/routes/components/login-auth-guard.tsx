import { useUserToken } from "@/store/userStore";
import { useCallback, useEffect } from "react";
import { useRouter } from "../hooks";

type Props = {
	children: React.ReactNode;
};

export default function LoginAuthGuard({ children }: Props) {
	const router = useRouter();
	const { access_token } = useUserToken();

	const check = useCallback(() => {
		if (!access_token) {
			router.replace("/auth/login");
		}
	}, [router, access_token]);

	useEffect(() => {
		check();
	}, [check]);

	// Don't render children if no token
	if (!access_token) {
		return null;
	}

	return <>{children}</>;
}
