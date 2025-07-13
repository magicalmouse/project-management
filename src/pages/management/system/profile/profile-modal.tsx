// import { useUserPermission } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { ProfileInfo, UserInfo } from "#/entity";
import dayjs from "dayjs";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";
import { useGetUserList } from "@/store/userStore";
import { useUpdateProfile } from "@/store/profileStore";
import { Loader2 } from "lucide-react";

export type ProfileModalProps = {
  formValue: ProfileInfo;
  title: string;
  show: boolean;
  onOk: (values: ProfileInfo) => void;
  onCancel: VoidFunction;
};

export default function ProfileModal({ title, show, formValue, onOk, onCancel }: ProfileModalProps) {

  const { getUserList, isLoading } = useGetUserList();
  const { updateProfile, isLoading: isUpdateProfileLoading } = useUpdateProfile();

  const form = useForm<ProfileInfo>({
    defaultValues: formValue,
  });

  // TODO: fix
  // const permissions = useUserPermission();
  const [users, setUsers] = useState<{label: string, value: string}[]>([]);

  const updateCompOptions = useCallback(async () => {
    const users = await getUserList();
    const temp_users = users.map(user => ({
      label: user.email ?? "",
      value: user.id ?? ""
    }))
    setUsers(temp_users);
  }, []);

  useEffect(() => {
    form.reset(formValue);
    updateCompOptions();
  }, [formValue, form, updateCompOptions]);

  const onSubmit = async (values: ProfileInfo) => {
    const normalizedUser = typeof values.user === 'string' ? values.user : values.user.id;
    const { id, ...dataWithoutId } = values;
    const profile = title === "New Profile"
      ? { ...dataWithoutId, user: normalizedUser }
      : { ...values, user: normalizedUser };
    await updateProfile(profile);
    onOk(values);
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
    					rules={{ required: "Please specify the field." }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
							control={form.control}
							name="dob"
              rules={{ required: "Please specify the field." }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Date of Birth</FormLabel>
									<FormControl>
										<Input
											type="date"
											value={field.value ? dayjs(field.value).format('YYYY-MM-DD') : ''}
											onChange={(e) => field.onChange(e.target.value ? dayjs(e.target.value).toDate() : null)}
										/>
									</FormControl>
                  <FormMessage />
								</FormItem>
							)}
						/>

            <FormField
							control={form.control}
							name="gender"
              rules={{ required: "Please specify the field." }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Gender</FormLabel>
									<FormControl>
										<ToggleGroup
											type="single"
											variant="outline"
											value={field.value}
											onValueChange={(value) => {
												field.onChange(value);
											}}
										>
											<ToggleGroupItem value={"male"}>Male</ToggleGroupItem>
											<ToggleGroupItem value={"female"}>Female</ToggleGroupItem>
										</ToggleGroup>
									</FormControl>
                  <FormMessage />
								</FormItem>
							)}
						/>

            <FormField
              control={form.control}
              name="country"
              rules={{ required: "Please specify the field." }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              rules={{ required: "Please specify the field." }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              rules={{ 
                required: "Please specify the field.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format.",
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="job_sites"
              rules={{ required: "Please specify the field." }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job sites</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user"
              rules={{ required: "Please specify the field." }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <FormControl>
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select user"
                      loading={isLoading}
                      options={users}
                      onChange={(value) => field.onChange(value)}
                      value={typeof field.value === 'string' ? field.value : field.value.id}
                      optionFilterProp="label"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                {isUpdateProfileLoading && <Loader2 className="animate-spin mr-2" />}
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
