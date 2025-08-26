import { LineLoading } from "@/components/loading";
import { GLOBAL_CONFIG } from "@/global-config";
import DashboardLayout from "@/layouts/dashboard";
import LoginAuthGuard from "@/routes/components/login-auth-guard";
import { Suspense } from "react";
import { Navigate, type RouteObject } from "react-router";
import { backendDashboardRoutes } from "./backend";
import { frontendDashboardRoutes } from "./frontend";

const getRoutes = (): RouteObject[] => {
	if (GLOBAL_CONFIG.routerMode === "frontend") {
		return frontendDashboardRoutes;
	}
	return backendDashboardRoutes;
};

export const dashboardRoutes: RouteObject[] = [
	{
		path: "/",
		element: (
			<LoginAuthGuard>
				<Suspense fallback={<LineLoading />}>
					<DashboardLayout />
				</Suspense>
			</LoginAuthGuard>
		),
		children: [{ index: true, element: <Navigate to={GLOBAL_CONFIG.defaultRoute} replace /> }, ...getRoutes()],
	},
];
