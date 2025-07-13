import { Suspense, lazy } from "react";
import { Outlet } from "react-router";
import type { RouteObject } from "react-router";

const LoginPage = lazy(() => import("@/pages/sys/login"));
const ResetPasswordPage = lazy(() => import("@/pages/sys/others/reset-password"));
const authCustom: RouteObject[] = [
	{
		path: "login",
		element: <LoginPage />,
	},
];

const resetPassword: RouteObject[] = [
	{
		path: "reset-password",
		element: <ResetPasswordPage />
	}
]

export const authRoutes: RouteObject[] = [
	{
		path: "auth",
		element: (
			<Suspense>
				<Outlet />
			</Suspense>
		),
		children: [...authCustom, ...resetPassword],
	},
];
