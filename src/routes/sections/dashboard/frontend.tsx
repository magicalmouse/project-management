import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import { Component } from "./utils";

export const frontendDashboardRoutes: RouteObject[] = [
	{ index: true, element: <Navigate to="job-dashboard" replace /> },
	{ path: "job-dashboard", element: Component("/pages/dashboard/job-dashboard") },
	{ path: "resume-workshop", element: Component("/pages/dashboard/resume-workshop") },
	// { path: "workbench", element: Component("/pages/dashboard/workbench") },

	{ path: "admin-dashboard", element: Component("/pages/dashboard/admin") },
	{ path: "admin-test", element: Component("/pages/dashboard/admin-test") },
	{ path: "admin-proposals", element: Component("/pages/dashboard/admin-proposals") },
	{ path: "admin-interviews", element: Component("/pages/dashboard/admin-interviews") },
	// {
	// 	path: "components",
	// 	children: [
	// 		{ index: true, element: <Navigate to="animate" replace /> },
	// 		{ path: "animate", element: Component("/pages/components/animate") },
	// 		{ path: "scroll", element: Component("/pages/components/scroll") },
	// 		{ path: "multi-language", element: Component("/pages/components/multi-language") },
	// 		{ path: "icon", element: Component("/pages/components/icon") },
	// 		{ path: "upload", element: Component("/pages/components/upload") },
	// 		{ path: "chart", element: Component("/pages/components/chart") },
	// 		{ path: "toast", element: Component("/pages/components/toast") },
	// 	],
	// },
	// {
	// 	path: "functions",
	// 	children: [
	// 		{ index: true, element: <Navigate to="clipboard" replace /> },
	// 		{ path: "clipboard", element: Component("/pages/functions/clipboard") },
	// 		{ path: "token_expired", element: Component("/pages/functions/token-expired") },
	// 	],
	// },
	{
		path: "management",
		children: [
			{ index: true, element: <Navigate to="system" replace /> },
			{
				path: "user",
				children: [
					{ index: true, element: <Navigate to="account" replace /> },
					// { path: "profile", element: Component("/pages/management/user/profile") },
					{ path: "account", element: Component("/pages/management/user/account") },
				],
			},
			{
				path: "system",
				children: [
					{ index: true, element: <Navigate to="user" replace /> },
					// { path: "permission", element: Component("/pages/management/system/permission") },
					// { path: "role", element: Component("/pages/management/system/role") },

					{ path: "user", element: Component("/pages/management/system/user") },
					{ path: "user/:id", element: Component("/pages/management/system/user/detail") },
					{ path: "proposal", element: Component("/pages/management/system/proposal/user") },
					{ path: "proposal/:userId", element: Component("/pages/management/system/proposal/detail") },
					{ path: "interview", element: Component("/pages/management/system/interview") },
				],
			},
		],
	},
	{
		path: "user",
		children: [
			{ index: true, element: <Navigate to="profile" replace /> },
			{ path: "profile", element: Component("/pages/management/user/profile") },
			{ path: "project-list", element: Component("/pages/user/project-list") },
			{ path: "project-list/:profileId", element: Component("/pages/management/user/project/detail") },
			{ path: "interview-list", element: Component("/pages/user/interview-list") },
			{ path: "interview-list/:interviewId", element: Component("/pages/user/interview-list/interview-details-page") },
			{ path: "interview", element: Component("/pages/user/interview-list") },
			{ path: "interview/:profileId", element: Component("/pages/management/user/interview/detail") },
			// { path: "interview/:profileId/:proposalId", element: Component("/pages/management/user/interview/detail") },
			// { path: "resume", element: Component("/pages/management/user/resume") },
		],
	},

	// {
	// 	path: "error",
	// 	children: [
	// 		{ index: true, element: <Navigate to="403" replace /> },
	// 		{ path: "403", element: Component("/pages/sys/error/Page403") },
	// 		{ path: "404", element: Component("/pages/sys/error/Page404") },
	// 		{ path: "500", element: Component("/pages/sys/error/Page500") },
	// 		{ path: "501", element: Component("/pages/sys/error/PageError") },
	// 	],
	// },
	// {
	// 	path: "menu_level",
	// 	children: [
	// 		{ index: true, element: <Navigate to="1a" replace /> },
	// 		{ path: "1a", element: Component("/pages/menu-level/menu-level-1a") },
	// 		{
	// 			path: "1b",
	// 			children: [
	// 				{ index: true, element: <Navigate to="2a" replace /> },
	// 				{ path: "2a", element: Component("/pages/menu-level/menu-level-1b/menu-level-2a") },
	// 				{
	// 					path: "2b",
	// 					children: [
	// 						{ index: true, element: <Navigate to="3a" replace /> },
	// 						{ path: "3a", element: Component("/pages/menu-level/menu-level-1b/menu-level-2b/menu-level-3a") },
	// 						{ path: "3b", element: Component("/pages/menu-level/menu-level-1b/menu-level-2b/menu-level-3b") },
	// 					],
	// 				},
	// 			],
	// 		},
	// 	],
	// },
	// {
	// 	path: "link",
	// 	children: [
	// 		{ index: true, element: <Navigate to="iframe" replace /> },
	// 		{ path: "iframe", element: Component("/pages/sys/others/link/iframe", { src: "https://ant.design/index-cn" }) },
	// 		{ path: "external-link", element: Component("/pages/sys/others/link/external-link", { src: "https://ant.design/index-cn" }) },
	// 	],
	// },
	// {
	// 	path: "permission",
	// 	children: [
	// 		{ index: true, element: Component("/pages/sys/others/permission") },
	// 		{ path: "page-test", element: Component("/pages/sys/others/permission/page-test") },
	// 	],
	// },
	// { path: "calendar", element: Component("/pages/sys/others/calendar") },
	// { path: "kanban", element: Component("/pages/sys/others/kanban") },
	// { path: "blank", element: Component("/pages/sys/others/blank") },
];
