'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import { DialogClose, DialogTitle } from '@radix-ui/react-dialog'
import { set } from 'date-fns'
import Image from 'next/image'
import React from 'react'
import { askQuestion } from './actions'
import { readStreamableValue } from 'ai/rsc'
import MDEditor from '@uiw/react-md-editor'
import CodeReferences from './code-references'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'
import { useTheme } from 'next-themes'
import WaveText from '@/components/wave-text'



const AskQuestionCard = () => {
    const {project} = useProject()
    const [question , setQuestion] = React.useState("")
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [filesReferences, setFilesReferences] = React.useState<{fileName: string, sourceCode: string, summary: string}[]>([])
    const [answer, setAnswer] = React.useState("")
    const saveAnswer = api.project.saveAnswer.useMutation()
    const {theme} = useTheme()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>)=>{
        setAnswer("")
        setFilesReferences([])
        e.preventDefault()
        if(!project?.id) return;
        setLoading(true)
        
        const {output, filesReferences}  = await askQuestion(question, project.id)
        setOpen(true)
        setFilesReferences(filesReferences)

        for await (const delta of readStreamableValue(output)){
            if(delta) {
                setAnswer(ans=> ans + delta)
            }
        }
        setLoading(false)
    } 

    const refetch = useRefetch()
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <Image src={"/logo.png"} alt="DevRecall" height={40} width={40}/>
              </DialogTitle>
              <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={()=> {
                saveAnswer.mutate({
                    projectId: project?.id!,
                    question,
                    filesReferences,
                    answer
                },{
                    onSuccess: () =>{
                        // setOpen(false);
                        setLoading(false);
                        setQuestion("")
                        refetch()
                        toast.success("Answer saved")
                    },
                    onError: ()=> {
                        toast.error("Failed to save answer")
                        setLoading(false)
                    }
                })
              }}>
                Save Answer
              </Button>
            </div>
          </DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>{`Q. ${question}`}</DialogTitle>
          {/* <div data-color-mode="light"></div> */}

          {answer === "" ? (
            <div className="flex items-center justify-center h-40">
              <WaveText text="Analysing..." />
            </div>
          ) : (
            <div data-color-mode={theme}>
              <MDEditor.Markdown
                source={answer}
                className="!h-full max-h-[40vh] max-w-[70vw] overflow-y-scroll rounded-xl px-4"
              />
            </div>
          )}
          <div className="h-4"></div>
          <CodeReferences filesReferences={filesReferences} />

          <div className='flex  w-full items-center justify-center'>
            <DialogClose asChild>
              <Button
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
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3">
        <CardHeader className='font-semibold text-xl'>Ask a Question</CardHeader>
        <CardContent className="flex flex-col h-64">
          <form onSubmit={onSubmit} className="flex flex-col flex-1 h-full">
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 resize-none"
            />
            <div className="h-4"></div>
            <div className='w-full flex items-center justify-center'>
              <Button type="submit" disabled={loading} className="mt-auto">
              Ask DevRecall !
            </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default AskQuestionCard