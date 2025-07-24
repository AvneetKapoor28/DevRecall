"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import { set } from "date-fns";
import Image from "next/image";
import React from "react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";
import { useTheme } from "next-themes";
import WaveText from "@/components/wave-text";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [filesReferences, setFilesReferences] = React.useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = React.useState("");
  const saveAnswer = api.project.saveAnswer.useMutation();
  const { theme } = useTheme();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer("");
    setFilesReferences([]);
    e.preventDefault();
    if (!project?.id) return;
    setLoading(true);

    const { output, filesReferences } = await askQuestion(question, project.id);
    setOpen(true);
    setFilesReferences(filesReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }
    setLoading(false);
  };

  const refetch = useRefetch();
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-h-[80vh] sm:max-w-[80vw]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <Image
                  src={"/logo.png"}
                  alt="DevRecall"
                  height={40}
                  width={40}
                />
              </DialogTitle>
              <Button
                className="cursor-pointer"
                disabled={saveAnswer.isPending}
                variant={"outline"}
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId: project?.id!,
                      question,
                      filesReferences,
                      answer,
                    },
                    {
                      onSuccess: () => {
                        // setOpen(false);
                        setLoading(false);
                        setQuestion("");
                        refetch();
                        toast.success("Answer saved");
                      },
                      onError: () => {
                        toast.error("Failed to save answer");
                        setLoading(false);
                      },
                    },
                  );
                }}
              >
                Save Answer
              </Button>
            </div>
            <DialogTitle className="text-2xl font-semibold">{`Q. ${question}`}</DialogTitle>
          </DialogHeader>
          {/* <div data-color-mode="light"></div> */}

          <div className="flex flex-col h-[60vh]">
  {/* Top Section */}
  <div className="flex gap-4 flex-grow overflow-hidden">
    {/* Markdown / Answer Section */}
    <div className="basis-3/4 overflow-hidden">
      {answer === "" ? (
        <div className="flex h-full items-center justify-center">
          <WaveText text="Analysing..." />
        </div>
      ) : (
        <div
          data-color-mode={theme}
          className="h-full overflow-hidden rounded-xl"
        >
          <MDEditor.Markdown
            source={answer}
            className="h-full overflow-y-auto px-4"
          />
        </div>
      )}
    </div>

    {/* Sidebar Section */}
    <div className="basis-1/4 flex flex-col gap-2 overflow-y-auto scrollbar-hidden">
      <h2 className="text-muted-foreground">Referenced Files</h2>
      <CodeReferences filesReferences={filesReferences} />
    </div>
  </div>

  {/* Bottom Section (Close Button) */}
  <div className="flex w-full items-center justify-center p-4">
    <DialogClose asChild>
      <Button
      className="cursor-pointer"
        type="button"
        onClick={() => {
          setOpen(false);
          setLoading(false);
        }}
      >
        Close
      </Button>
    </DialogClose>
  </div>
</div>

        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3 bg-dashboard-card">
        <CardHeader className="text-xl font-semibold">
          Ask a Question
        </CardHeader>
        <CardContent className="flex h-64 flex-col">
          <form onSubmit={onSubmit} className="flex h-full flex-1 flex-col">
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 resize-none"

            />
            <div className="h-4"></div>
            <div className="flex w-full items-center justify-center">
              <Button type="submit" disabled={loading} className="mt-auto cursor-pointer">
                Ask DevRecall !
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
