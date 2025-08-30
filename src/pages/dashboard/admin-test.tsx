import { useAuth } from "@/components/auth/use-auth";
import { useRouter } from "@/routes/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Text, Title } from "@/ui/typography";
import { useEffect } from "react";

export default function AdminTestDashboard() {
	const { user } = useAuth();
	const router = useRouter();

	// Check if user is admin
	useEffect(() => {
		if (user && user.role !== 0) {
			router.replace("/job-dashboard");
			return;
		}
	}, [user, router]);

	// Don't render anything if user is not admin
	if (!user || user.role !== 0) {
		return null;
	}

	return (
		<div className="w-full space-y-6 p-6">
			<div>
				<Title as="h1">Admin Dashboard (Test)</Title>
				<Text className="text-muted-foreground">This is a simplified test version to check if the basic routing works.</Text>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Test Card 1</CardTitle>
					</CardHeader>
					<CardContent>
						<Text>Basic card content without charts</Text>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Test Card 2</CardTitle>
					</CardHeader>
					<CardContent>
						<Text>Another basic card</Text>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Test Card 3</CardTitle>
					</CardHeader>
					<CardContent>
						<Text>Third basic card</Text>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Test Card 4</CardTitle>
					</CardHeader>
					<CardContent>
						<Text>Fourth basic card</Text>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>User Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<Text>
							<strong>User ID:</strong> {user.id}
						</Text>
						<Text>
							<strong>Username:</strong> {user.username}
						</Text>
						<Text>
							<strong>Email:</strong> {user.email}
						</Text>
						<Text>
							<strong>Role:</strong> {user.role} (Admin)
						</Text>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
