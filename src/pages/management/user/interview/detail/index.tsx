import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import Table, { type ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import type { InterviewInfo } from "#/entity";
import InterviewModal, { Interview_Progress_Default, type InterviewModalProps } from "./interview-modal";
import { useParams, useRouter } from "@/routes/hooks";
import { InterviewProgress } from "@/types/enum";
import { useDeleteInterview, useGetInterviewList } from "@/store/interviewStore";
import { useUserInfo } from "@/store/userStore";

const defaultInterviewValue: InterviewInfo = {
  id: "",
  user: "",
  profile: "",
  meeting_title: "",
	meeting_date: "",
  meeting_link: "",
  job_description: "",
  interviewer: "",
  progress: InterviewProgress.PENDING
};

export default function InterviewPage() {
  // const permissions = useUserPermission();
  const { back } = useRouter();
  const { profileId } = useParams();
  const userInfo = useUserInfo();

  const { getInterviewList, isLoading: isGetInterviewLoading } = useGetInterviewList();
  const { deleteInterview, isLoading: isDeleteInterviewLoading } = useDeleteInterview();

  const [interviewModalProps, setInterviewModalProps] = useState<InterviewModalProps>({
    formValue: { ...defaultInterviewValue },
    title: "New Interview",
    show: false,
    onOk: () => {
      setInterviewModalProps((prev) => ({ ...prev, show: false }));
      fetchData();
    },
    onCancel: () => {
      setInterviewModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const [dataSource, setDataSource] = useState<InterviewInfo[]>([]);

  useEffect(() => {
    console.log("profileId", profileId)
    fetchData();
  }, [])

  const columns: ColumnsType<InterviewInfo> = [
    {
      title: "Meeting Title",
      dataIndex: "meeting_title",
      width: 150,
      sorter: (a, b) => a.id.localeCompare(b.id),
      render: (_, record) => <div>{(record.meeting_title)}</div>,
    },
    {
      title: "Meeting Link",
      dataIndex: "meeting_link",
      width: 100,
      render: (_, record) => <div>{(record.meeting_link)}</div>,
    },
    {
      title: "Meeting Date",
      dataIndex: "meeting_date",
      width: 50,
      render: (_, record) => <Badge variant="info">{record.meeting_date}</Badge>,
    },
    {
      title: "Job Description",
      dataIndex: "job_description",
      width: 250,
      render: (_, record) => <div className="overflow-auto max-h-20">{(record.job_description)}</div>,
    },
    {
      title: "Profile",
      dataIndex: "profile",
      width: 50,
      render: (_, record) => <div>{typeof record.profile === "object" && record.profile.email}</div>,
    },
    {
      title: "User",
      dataIndex: "user",
      width: 50,
      render: (_, record) => <div>{typeof record.user === "object" && record.user.email}</div>,
    },
    {
      title: "Interviewer",
      dataIndex: "interviewer",
      width: 50,
      render: (_, record) => <div>{(record.interviewer)}</div>,
    },
    {
      title: "Progress",
      dataIndex: "progress",
      width: 50,
      render: (_, record) => <Badge variant="info">{Interview_Progress_Default.find(item => item.value === record.progress)?.label}</Badge>,
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
        </div>
      ),
    },
  ];

  const onCreate = () => {
    setInterviewModalProps((prev) => ({
      ...prev,
      show: true,
      ...defaultInterviewValue,
      title: "New Interview",
      formValue: { ...defaultInterviewValue, user: userInfo.id!, profile: profileId! },
    }));
  };

  const onEdit = (formValue: InterviewInfo) => {
    console.log("onEdit", formValue)
    setInterviewModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Edit Interview",
      formValue,
    }));
  };

  const onDelete = async (formValue: InterviewInfo) => {
    console.log("onDelete", formValue)
    await deleteInterview(formValue.id);
    fetchData();
  }

  const fetchData = async () => {
    const data = await getInterviewList(profileId, userInfo.id);
    setDataSource(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button variant={"secondary"} onClick={() => back()}>{'<'}</Button>
          <div>Interview List</div>
          <Button onClick={() => onCreate()}>New Interview</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table rowKey="id" size="small" scroll={{ x: "max-content" }} loading={isGetInterviewLoading || isDeleteInterviewLoading} columns={columns} dataSource={dataSource} />
      </CardContent>
      <InterviewModal {...interviewModalProps} />
    </Card>
  );
}
