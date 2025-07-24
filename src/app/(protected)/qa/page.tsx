"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";
import { useTheme } from "next-themes";
import { FadeInUp } from "@/components/fade-up";

const QAPage = () => {
  const { projectId } = useProject();
  const { data: questions, isLoading } = api.project.getQuestions.useQuery({
    projectId,
  });

  const [questionIndex, setQuestionIndex] = React.useState<number>(0);
  const question = questions?.[questionIndex];
  const { theme } = useTheme();
  if (isLoading) {
    return (
      <div className="h-full">
        <AskQuestionCard />
        <div className="h-4"></div>
        <h1 className="text-xl font-semibold">Saved Questions</h1>
        <div className="flex items-center justify-center h-64">
          <div className="border-primary h-16 w-16 animate-spin rounded-full border-t-2 border-b-2"></div>
        </div>
      </div>
    );
  }
  return (
    <FadeInUp>
      <Sheet>
        <AskQuestionCard />
        <div className="h-4"></div>
        <h1 className="text-xl font-semibold">Saved Questions</h1>
        <div className="h-2"></div>
        <div className="flex flex-col gap-2">
          {questions?.map((question, index) => (
            <React.Fragment key={index}>
              <SheetTrigger onClick={() => setQuestionIndex(index)}>
                <div className="bg-saved-qa-card hover:bg-saved-qa-card-hover flex items-center gap-4 rounded-lg border p-4 shadow transition">
                  <img
                    src={question.user.imageUrl ?? ""}
                    alt={
                      (question.user.firstName ?? "") +
                      (question.user.lastName ?? "")
                    }
                    className="rounded-full"
                    height={30}
                    width={30}
                  />
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-foreground line-clamp-1 text-lg font-medium">
                        {question.question}
                      </p>
                      <span className="text-xs whitespace-nowrap text-gray-400">
                        {question.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {question.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </React.Fragment>
          ))}
        </div>
        {question && (
          <SheetContent className="bg-background flex w-full flex-col gap-6 overflow-auto rounded-lg p-8 shadow-lg sm:max-w-[80vw]">
            <SheetHeader>
              <SheetTitle className="text-foreground mb-2 text-2xl font-bold">
                {`Q. ${question.question}`}
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-grow gap-4 overflow-hidden">
              {/* Markdown / Answer Section */}
              <div className="flex-3 overflow-hidden">
                <div
                  data-color-mode={theme}
                  className="h-full overflow-hidden rounded-xl"
                >
                  <MDEditor.Markdown
                    source={question.answer}
                    className="h-full overflow-y-auto px-4"
                  />
                </div>
              </div>

              {/* Sidebar Section */}
              <div className="scrollbar-hidden flex flex-1 flex-col gap-2 overflow-y-auto">
                <h2 className="text-muted-foreground">Referenced Files</h2>
                <CodeReferences
                  filesReferences={question.filesReferences as any}
                />
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </FadeInUp>
  );
};

export default QAPage;
