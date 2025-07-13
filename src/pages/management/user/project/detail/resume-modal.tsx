// import { useUserPermission } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ResumeBuilder from "../../resume";
import { Input } from "@/ui/input";


export interface ResumeFormData {
  job_description: string;
  resume: string;
}

export type ResumeModalProps = {
  formValue: ResumeFormData;
  title: string;
  show: boolean;
  onOk: (values: ResumeFormData) => void;
  onCancel: VoidFunction;
};

export default function ResumeModal({ title, show, formValue, onOk, onCancel }: ResumeModalProps) {
  console.log("resume modal", formValue)

  const form = useForm<ResumeFormData>({
    defaultValues: formValue,
  });


  useEffect(() => {
    form.reset(formValue);
  }, [formValue, form]);

  const onSubmit = async (values: ResumeFormData) => {
    console.log(values);
    onOk(values);
  };

  return (
    <Dialog  open={show} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="!max-w-3/4 max-h-[90%]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="resume"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ResumeBuilder 
                      {...field}
                      resume={field.value}
                      job_description={formValue.job_description}
                      onResumeChange={field.onChange}
                      onJobDescriptionChange={(value) => form.setValue("job_description", value)}
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
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
