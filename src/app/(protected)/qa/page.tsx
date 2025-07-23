'use client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'
import AskQuestionCard from '../dashboard/ask-question-card'
import MDEditor from '@uiw/react-md-editor'
import CodeReferences from '../dashboard/code-references'
import { useTheme } from 'next-themes'

const QAPage = () => {
    const {projectId} = useProject()
    const {data: questions} = api.project.getQuestions.useQuery({
        projectId
    })

    const [questionIndex, setQuestionIndex] = React.useState<number>(0)
    const question = questions?.[questionIndex]
    const {theme} = useTheme()
  return (
    <Sheet>
      <AskQuestionCard/>
      <div className='h-4'></div>
      <h1 className='text-xl font-semibold'>Saved Questions</h1>
      <div className="h-2"></div>
      <div className='flex flex-col gap-2'>
        {questions?.map((question, index) => (
          <React.Fragment key={index}>
            <SheetTrigger onClick={() => setQuestionIndex(index)}>
              <div className="flex items-center gap-4 rounded-lg border bg-saved-qa-card p-4 shadow hover:bg-saved-qa-card-hover transition">
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
                    <p className="line-clamp-1 text-lg font-medium text-foreground">
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
        <SheetContent className="sm:max-w-[80vw] bg-background p-8 rounded-lg shadow-lg flex flex-col gap-6 overflow-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold mb-2 text-foreground">
              {question.question}
            </SheetTitle>
          </SheetHeader>
          <div className=" bg-card rounded-lg border p-6 shadow-sm max-h-[40vh] overflow-auto" data-color-mode={theme}>
            <MDEditor.Markdown
              source={question.answer}
              className="prose prose-sm max-w-none text-gray-700 p-2 rounded-sm"
            />
          </div>
          <div className=" bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-card-foreground">Code References</h2>
            <CodeReferences filesReferences={(question.filesReferences ?? []) as any} />
          </div>
        </SheetContent>
      )}
    </Sheet>
  )
}

export default QAPage