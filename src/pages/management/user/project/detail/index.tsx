import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import Table, { type ColumnsType } from "antd/es/table";
import { Key, useEffect, useRef, useState } from "react";
import type { InterviewInfo, ProposalInfo } from "#/entity";
import ProjectModal, { type ProjectModalProps } from "./project-modal";
import { useParams, useRouter } from "@/routes/hooks";
import { useUserInfo } from "@/store/userStore";
import { useDeleteProposal, useGetProposalList } from "@/store/proposalStore";
import { TableProps } from "antd/lib";
import { DatePicker, Input, Popconfirm, Space } from "antd";
import { useLocation } from "react-router";
import InterviewModal, { InterviewModalProps } from "../../interview/detail/interview-modal";
import { InterviewProgress } from "@/types/enum";
import { useGetInterviewList } from "@/store/interviewStore";
import { FilterDropdownProps } from "antd/es/table/interface";
import dayjs, { Dayjs } from "dayjs";

const defaultProposalValue: ProposalInfo = {
	id: "",
	job_description: "",
	resume: "",
	cover_letter: "",
	profile: "",
	user: "",
	job_link: "",
	company: "",
	created_at: "",
};

const defaultInterviewValue: InterviewInfo = {
	id: "",
	user: "",
	profile: "",
	meeting_title: "",
	meeting_date: "",
	meeting_link: "",
	proposal: {
		id: "",
	},
	job_description: "",
	interviewer: "",
	progress: InterviewProgress.PENDING,
};

export default function ProjectPage() {
	// const permissions = useUserPermission();
	const { back } = useRouter();
	const { profileId } = useParams();
	const location = useLocation();

	const searchInput = useRef(null);
	const [searchText, setSearchText] = useState("");
	const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

	const userInfo = useUserInfo();
	const { getProposalList, isLoading: isGetProposalListLoading } = useGetProposalList();
	const { deleteProposal, isLoading: isDeleteProposalLoading } = useDeleteProposal();
	const { getInterviewList, isLoading: isGetInterviewLoading } = useGetInterviewList();

	const [projectModalProps, setProjectModalProps] = useState<ProjectModalProps>({
		formValue: { ...defaultProposalValue },
		title: "New Proposal",
		show: false,
		onOk: () => {
			setProjectModalProps((prev) => ({ ...prev, show: false }));
			fetchData();
		},
		onCancel: () => {
			setProjectModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	const [interviewModalProps, setInterviewModalProps] = useState<InterviewModalProps>({
		formValue: { ...defaultInterviewValue },
		title: "New Interview",
		show: false,
		onOk: () => {
			setInterviewModalProps((prev) => ({ ...prev, show: false }));
		},
		onCancel: () => {
			setInterviewModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	const [dataSource, setDataSource] = useState<ProposalInfo[]>([]);
	const [interviewData, setInterviewData] = useState<InterviewInfo[]>([]);

	const isInterviewed = (proposalId: string) => interviewData.some((interview) => interview.proposal === proposalId);

	useEffect(() => {
		fetchData();
	}, []);

	// Search filter
	const handleSearch = (selectedKeys: string[], confirm: VoidFunction) => {
		confirm();
		setSearchText(selectedKeys[0]);
	};
	const handleReset = (clearFilters?: () => void) => {
		clearFilters!();
		setSearchText("");
	};
	const getColumnSearchProps = (dataIndex: keyof ProposalInfo): any => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={searchInput}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => handleSearch(selectedKeys as string[], confirm)}
					style={{ marginBottom: 8, display: "block" }}
				/>
				<Space>
					<Button
						// type="primary"
						onClick={() => handleSearch(selectedKeys as string[], confirm)}
						// icon={<Icon icon="mingcute:search-2-line" />}
						// size="small"
						className="w-20"
					>
						Search
					</Button>
					<Button
						onClick={() => {
							handleReset(clearFilters);
							confirm();
						}}
						// size="small"
						className="w-20"
					>
						Reset
					</Button>
				</Space>
			</div>
		),
		filterIcon: (filtered: boolean) => <Icon icon="mingcute:search-2-line" className={filtered ? "text-primary" : ""} />,
		onFilter: (value: string, record: ProposalInfo) => (record[dataIndex] || "").toString().toLowerCase().includes(value.toLowerCase()),
	});

	const columns: ColumnsType<ProposalInfo> = [
		{
			title: "Job Link",
			dataIndex: "job_link",
			...getColumnSearchProps("job_link"),
			width: 150,
			// sorter: (a, b) => a.id.localeCompare(b.id),
			render: (_, record) => <div>{record.job_link}</div>,
		},
		{
			title: "Company",
			dataIndex: "company",
			width: 50,
			// sorter: (a, b) => a.id.localeCompare(b.id),
			render: (_, record) => <div>{record.company}</div>,
		},
		{
			title: "Job Description",
			dataIndex: "job_description",
			width: 250,
			// sorter: (a, b) => a.id.localeCompare(b.id),
			render: (_, record) => <div className="overflow-auto max-h-20">{record.job_description}</div>,
		},
		{
			title: "Resume",
			dataIndex: "resume",
			...getColumnSearchProps("resume"),
			width: 50,
			render: (_, record) => <div>{record.resume}</div>,
		},
		{
			title: "Cover Letter",
			dataIndex: "cover_letter",
			width: 100,
			render: (_, record) => <div className="overflow-auto max-h-20">{record.cover_letter}</div>,
		},
		{
			title: "Time",
			dataIndex: "created_at",
			filterDropdown: ({
				setSelectedKeys,
				selectedKeys,
				confirm,
				clearFilters,
			}: {
				setSelectedKeys: (selectedKeys: Key[]) => void;
				selectedKeys: Key[];
				confirm: () => void;
				clearFilters?: () => void;
			}) => {
				// safely cast stored ISO strings back to Dayjs range
				const value = Array.isArray(selectedKeys[0]) ? (selectedKeys[0] as string[]) : [];

				const rangeValue: [Dayjs, Dayjs] | undefined = value.length === 2 ? [dayjs(value[0]), dayjs(value[1])] : undefined;

				return (
					<div style={{ padding: 8 }}>
						<DatePicker.RangePicker
							value={rangeValue}
							onChange={(dates) => {
								if (dates && dates[0] && dates[1]) {
									const isoRange = [dates[0].toISOString(), dates[1].toISOString()];
									setSelectedKeys([isoRange as unknown as Key]);
								} else {
									setSelectedKeys([]);
								}
							}}
							style={{ marginBottom: 8, display: "block" }}
						/>
						<Space>
							<Button onClick={() => confirm()} className="w-20">
								Filter
							</Button>
							<Button
								onClick={() => {
									clearFilters?.();
									confirm();
								}}
								className="w-20"
							>
								Reset
							</Button>
						</Space>
					</div>
				);
			},
			onFilter: (value: Key, record: ProposalInfo) => {
				const [start, end] = value as unknown as string[];

				const dateValue = record["created_at"];
				if (!dateValue) return false;

				const recordDate = dayjs(dateValue);
				return recordDate.isAfter(dayjs(start)) && recordDate.isBefore(dayjs(end));
			},
			width: 50,
			render: (_, record) => <div>{new Date(record.created_at!).toLocaleString()}</div>,
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-end text-gray">
					<Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon" onClick={() => onDelete(record)}>
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
					</Button>
					<Button variant="ghost" size="icon" onClick={() => onCreateInterview(record)}>
						<Icon icon="mingcute:add-fill" size={18} className="text-green-500!" />
					</Button>
				</div>
			),
		},
	];

	const onCreate = () => {
		setProjectModalProps((prev) => ({
			...prev,
			show: true,
			...defaultProposalValue,
			title: "New Proposal",
			formValue: { ...defaultProposalValue, profile: profileId!, user: userInfo.id! },
		}));
	};

	const onEdit = (formValue: ProposalInfo) => {
		setProjectModalProps((prev) => ({
			...prev,
			show: true,
			title: "Edit Proposal",
			formValue,
		}));
	};

	const onDelete = async (formValue: ProposalInfo) => {
		await deleteProposal(formValue.id);
		fetchData();
	};

	const rowSelection: TableProps<ProposalInfo>["rowSelection"] = {
		onChange: (selectedRowKeys: React.Key[], selectedRows: ProposalInfo[]) => {
			setSelectedRowKeys(selectedRowKeys.map(String));
		},
	};

	const handleDelete = async () => {
		await deleteProposal(undefined, selectedRowKeys);
		setSelectedRowKeys([]);
		fetchData();
	};

	const fetchData = async () => {
		const data = await getProposalList(userInfo.id!, profileId!);
		setDataSource(data);

		const interviewList = await getInterviewList(profileId!, userInfo.id!);
		setInterviewData(interviewList);
	};

	// interview modal
	const onCreateInterview = (formValue: ProposalInfo) => {
		setInterviewModalProps((prev) => ({
			...prev,
			show: true,
			title: "New Interview",
			formValue: {
				...defaultInterviewValue,
				profile: profileId!,
				user: userInfo.id!,
				job_description: formValue.job_description,
				proposal: formValue.id,
			},
		}));
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<Button variant={"secondary"} onClick={() => back()}>
						{"<"}
					</Button>
					<div>Proposal List</div>
					<Button onClick={() => onCreate()}>New Proposal</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Space className="w-full mb-4 flex! justify-between">
					<Popconfirm title="Delete selected rows?" onConfirm={handleDelete} okText="Yes" cancelText="No" disabled={selectedRowKeys.length === 0}>
						<Button variant={"destructive"} disabled={selectedRowKeys.length === 0}>
							Delete
						</Button>
					</Popconfirm>
					<div>
						Total &nbsp;
						<Badge>{dataSource.length}</Badge>
					</div>
				</Space>
				<Table
					rowKey="id"
					size="small"
					scroll={{ x: "max-content" }}
					loading={isGetProposalListLoading || isDeleteProposalLoading}
					columns={columns}
					dataSource={dataSource}
					rowSelection={rowSelection}
					rowClassName={(record, index) => {
						if (isInterviewed(record.id)) {
							return "bg-green-50 dark:bg-green-900/30";
						}
						return "";
					}}
				/>
			</CardContent>
			<ProjectModal {...projectModalProps} />
			<InterviewModal {...interviewModalProps} />
		</Card>
	);
}
