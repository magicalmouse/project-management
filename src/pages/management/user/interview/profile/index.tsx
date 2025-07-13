import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";
import Table, { type ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import type { ProfileInfo } from "#/entity";
import { useGetProfileList } from "@/store/profileStore";
import { useUserInfo } from "@/store/userStore";
import { usePathname, useRouter } from "@/routes/hooks";

export default function InterviewProfilePage() {
  // const permissions = useUserPermission();
  const currentUser = useUserInfo();
  const { push } = useRouter();
  const pathname = usePathname();

  const { getProfileList, isLoading } = useGetProfileList();

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
  ];

  const fetchData = async () => {
    const data = await getProfileList(currentUser.id);
    setDataSource(data);
  };

  const handleRowClick = (profileId: string) => {
    push(`${pathname}/${profileId}`);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>Profile List</div>
        </div>
      </CardHeader>
      <CardContent>
        <Table 
          rowKey="id" 
          size="small" 
          scroll={{ x: "max-content" }} 
          loading={isLoading} 
          columns={columns} 
          dataSource={dataSource} 
          onRow={(record, rowIndex) => {
            return {
              onClick: () => handleRowClick(record.id),
              className: 'cursor-pointer'
            };
          }}
        />
      </CardContent>
    </Card>
  );
}
