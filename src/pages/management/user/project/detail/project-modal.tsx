// import { useUserPermission } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { ProposalInfo } from "#/entity";
import { Loader2 } from "lucide-react";
import { useUpdateProposal } from "@/store/proposalStore";
import { Textarea } from "@/ui/textarea";
import ResumeModal, { ResumeFormData, ResumeModalProps } from "./resume-modal";

export type ProjectModalProps = {
  formValue: ProposalInfo;
  title: string;
  show: boolean;
  onOk: (values: ProposalInfo) => void;
  onCancel: VoidFunction;
};

const defaultResumeValue: ResumeFormData = {
  job_description: "",
  resume: ""
}

export default function ProjectModal({ title, show, formValue, onOk, onCancel }: ProjectModalProps) {

  const { updateProposal, isLoading } = useUpdateProposal();

  const [resumeModalProps, setResumeModalProps] = useState<ResumeModalProps>({
    formValue: { ...defaultResumeValue },
    title: "New Resume",
    show: false,
    onOk: (resumeFormData) => {
      form.setValue("resume", resumeFormData.resume);
      form.setValue("job_description", resumeFormData.job_description);
      setResumeModalProps((prev) => ({ ...prev, show: false }));
    },
    onCancel: () => {
      setResumeModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const form = useForm<ProposalInfo>({
    defaultValues: formValue,
  });

  // TODO: fix
  // const permissions = useUserPermission();

  useEffect(() => {
    form.reset(formValue);
  }, [formValue, form]);

  const onResumeCreate = () => {
    const jobDescription = form.watch("job_description");
    console.log("onResumeCreate", jobDescription)
    setResumeModalProps((prev) => ({
      ...prev,
      formValue: {...defaultResumeValue, job_description: jobDescription},
      title: "New resume",
      show: true,
    }));
  }

  const onSubmit = async (values: ProposalInfo) => {
    const { id, created_at, ...dataWithoutId } = values;
    const profile = title === "New Proposal" ? dataWithoutId : values;
    await updateProposal(profile);
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
              name="job_link"
    					rules={{ required: "Please specify the field." }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Link</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
    					rules={{ required: "Please specify the field." }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
							name="resume"
              rules={{ required: "Please specify the field." }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Resume</FormLabel>
									<FormControl>
										<div className="flex gap-2">
                      <Input {...field} readOnly />
                      <Button
                        type="button"
                        variant="default"
                        onClick={onResumeCreate}
                      >
                        Select
                      </Button>
                    </div>
									</FormControl>
                  <FormMessage />
								</FormItem>
							)}
						/>

            <FormField
							control={form.control}
							name="cover_letter"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Cover Letter</FormLabel>
									<FormControl>
										<Input {...field} />
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
        <ResumeModal {...resumeModalProps} />
      </DialogContent>
    </Dialog>
  );
}
