import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import Table, { type ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import type { ProfileInfo } from "#/entity";
import ProfileModal, { type ProfileModalProps } from "./profile-modal";
import { useDeleteProfile, useGetProfileList } from "@/store/profileStore";

const defaultProfileValue: ProfileInfo = {
  id: "",
	name: "",
	dob: "",
	gender: "",
	phone: "",
	email: "",
	job_sites: "",
	country: "",
	user: {
    id: "",
    email: ""
  },
};

export default function ProfilePage() {
  // const permissions = useUserPermission();
  const { getProfileList, isLoading } = useGetProfileList();
  const { deleteProfile, isLoading: isDeleteProfileLoading } = useDeleteProfile();

  const [profileModalProps, setProfileModalProps] = useState<ProfileModalProps>({
    formValue: { ...defaultProfileValue },
    title: "New profile",
    show: false,
    onOk: () => {
      setProfileModalProps((prev) => ({ ...prev, show: false }));
      fetchData();
    },
    onCancel: () => {
      console.log("oncancel")
      setProfileModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const [dataSource, setDataSource] = useState<ProfileInfo[]>([]);

  useEffect(() => {
    fetchData();
  }, [])

  const columns: ColumnsType<ProfileInfo> = [
    {
      title: "Name",
      dataIndex: "name",
      width: 150,
      render: (_, record) => <div>{(record.name)}</div>,
    },
    {
      title: "Date of Birth",
      dataIndex: "dob",
      width: 50,
      render: (_, record) => <Badge variant="info">{record.dob}</Badge>,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      width: 50,
      render: (_, record) => <div>{(record.gender)}</div>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      width: 100,
      render: (_, record) => <div>{(record.phone)}</div>,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 150,
      render: (_, record) => <div>{(record.email)}</div>,
    },
    {
      title: "Job sites",
      dataIndex: "job_sites",
      width: 200,
      render: (_, record) => <div>{(record.job_sites)}</div>,
    },
    {
      title: "User",
      dataIndex: "user",
      width: 100,
      render: (_, record) => <div>{(typeof record.user !== 'string' ? record.user.email ?? "" : undefined)}</div>,
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
    setProfileModalProps((prev) => ({
      ...prev,
      show: true,
      ...defaultProfileValue,
      title: "New Profile",
      formValue: { ...defaultProfileValue },
    }));
  };

  const onEdit = (formValue: ProfileInfo) => {
    console.log("onEdit", formValue)
    setProfileModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Edit Profile",
      formValue,
    }));
  };

  const onDelete = async (formValue: ProfileInfo) => {
    console.log("onDelete", formValue)
    await deleteProfile(formValue.id);
    fetchData();
  }

  const fetchData = async () => {
    const data = await getProfileList();
    setDataSource(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>Profile List</div>
          <Button onClick={() => onCreate()}>New Profile</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table rowKey="id" size="small" scroll={{ x: "max-content" }} loading={isLoading || isDeleteProfileLoading} columns={columns} dataSource={dataSource} />
      </CardContent>
      <ProfileModal {...profileModalProps} />
    </Card>
  );
}
