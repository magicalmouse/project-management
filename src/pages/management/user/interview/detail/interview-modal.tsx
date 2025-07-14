// import { useUserPermission } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { InterviewInfo } from "#/entity";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import { InterviewProgress } from "@/types/enum";
import { useUpdateInterview } from "@/store/interviewStore";
import { Textarea } from "@/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

export type InterviewModalProps = {
	formValue: InterviewInfo;
	title: string;
	show: boolean;
	onOk: (values: InterviewInfo) => void;
	onCancel: VoidFunction;
};

export const Interview_Progress_Default = [
	{
		label: "Pending",
		value: InterviewProgress.PENDING,
	},
	{
		label: "Success",
		value: InterviewProgress.SUCCESS,
	},
	{
		label: "Fail",
		value: InterviewProgress.FAIL,
	},
];

export default function InterviewModal({ title, show, formValue, onOk, onCancel }: InterviewModalProps) {
	const { updateInterview, isLoading } = useUpdateInterview();

	const form = useForm<InterviewInfo>({
		defaultValues: formValue,
	});

	// TODO: fix
	// const permissions = useUserPermission();
	const [progress, setProgress] = useState<{ label: string; value: InterviewProgress }[]>([]);

	const updateCompOptions = useCallback(async () => {
		setProgress(Interview_Progress_Default);
	}, []);

	useEffect(() => {
		form.reset(formValue);
		updateCompOptions();
	}, [formValue, form, updateCompOptions]);

	const onSubmit = async (values: InterviewInfo) => {
		// const normalizedUser = typeof values.proposal === 'string' ? values.proposal : values.proposal.id;
		// const { id, ...dataWithoutId } = values;
		// const interview = title === "New Interview" ? {...dataWithoutId, proposal: normalizedUser} : {...values, proposal: normalizedUser};

		const { id, ...dataWithoutId } = values;
		await updateInterview(title === "New Interview" ? dataWithoutId : values);
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
							name="meeting_title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Meeting Title</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="meeting_link"
							rules={{ required: "Please specify the field." }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Meeting Link</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="meeting_date"
							rules={{ required: "Please specify the field." }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Meeting Date</FormLabel>
									<FormControl>
										<Input
											type="datetime-local"
											value={field.value ? dayjs(field.value).format("YYYY-MM-DDTHH:mm") : ""}
											onChange={(e) => field.onChange(e.target.value ? dayjs(e.target.value).toDate() : null)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="job_description"
							rules={{ required: "Please specify the field." }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Job Description</FormLabel>
									<FormControl>
										<Textarea className="max-h-64" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="interviewer"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Interviewer</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="progress"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Progress</FormLabel>
									<FormControl>
										<Select {...field} value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{progress.map((progress) => (
													<SelectItem key={String(progress.value)} value={String(progress.value)}>
														{progress.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
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
								{isLoading && <Loader2 className="animate-spin mr-2" />}
								Confirm
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
