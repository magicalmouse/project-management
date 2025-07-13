// import { USER_LIST } from "@/_mock/assets";
import { Icon } from "@/components/icon";
import { usePathname, useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Role_Old, UserInfo } from "#/entity";
import { BasicStatus } from "#/enum";
import { useDeleteUser, useGetUserList } from "@/store/userStore";
import { useEffect } from "react";
import { faker } from "@faker-js/faker";

// TODO: fix
// const USERS: UserInfo[] = USER_LIST as UserInfo[];
const USERS: Partial<UserInfo>[] = [
	
];

export default function UserPage() {
	const { push } = useRouter();
	const pathname = usePathname();

	const { getUserList, isLoading } = useGetUserList();
	const { deleteUser, isLoading: isDeleteLoading } = useDeleteUser();

	const onInitial = async () => {
		USERS.length = 0;
		const users = await getUserList();
		USERS.push(...users);
		console.log(USERS)
	}
	useEffect(() => {
		onInitial()
	}, []);

	const columns: ColumnsType<Partial<UserInfo>> = [
		{
			title: "Name",
			dataIndex: "username",
			width: 150,
			render: (_, record) => {
				return (
					<div className="flex">
						<img alt="" src={faker.image.avatarGitHub()} className="h-10 w-10 rounded-full" />
						<div className="ml-2 flex flex-col">
							<span className="text-sm">{record.username ?? "not specified"}</span>
							<span className="text-xs text-text-secondary">{record.email}</span>
						</div>
					</div>
				);
			},
		},
		{
			title: "Email",
			dataIndex: "email",
			align: "center",
			width: 120,
			render: (_, record) => (<span className="text-sm">{record.email}</span>),
		},
		{
			title: "Country",
			dataIndex: "country",
			align: "center",
			width: 120,
			render: (_, record) => <Badge variant="default">{record.country ?? "not specified"}</Badge>,
		},
		{
			title: "Summary",
			dataIndex: "summary",
			align: "center",
			width: 120,
			render: (_, record) => (<span className="text-sm">{record.summary}</span>),
		},
		{
			title: "Status",
			dataIndex: "status",
			align: "center",
			width: 120,
			render: (status) => <Badge variant={status === BasicStatus.DISABLE ? "error" : "success"}>{status === BasicStatus.DISABLE ? "Disable" : "Enable"}</Badge>,
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray-500">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							push(`${pathname}/${record.id}`);
						}}
					>
						<Icon icon="mdi:card-account-details" size={18} />
					</Button>
					{/* <Button variant="ghost" size="icon" onClick={() => {}}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button> */}
					<Button variant="ghost" size="icon" onClick={async () => {
						await deleteUser(record.id!)
					}}>
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
					</Button>
				</div>
			),
		},
	];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>User List</div>
					{/* <Button onClick={() => {}}>New</Button> */}
				</div>
			</CardHeader>
			<CardContent>
				<Table rowKey="id" size="small" scroll={{ x: "max-content" }} loading={isLoading || isDeleteLoading} columns={columns} dataSource={USERS} />
			</CardContent>
		</Card>
	);
}
