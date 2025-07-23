// 'use client'
// import { Sheet, SheetTrigger } from '@/components/ui/sheet'
// import useProject from '@/hooks/use-project'
// import { api } from '@/trpc/react'
// import React from 'react'
// import AskQuestionCard from '../dashboard/ask-question-card'

// const QAPage = () => {
//     const {projectId} = useProject()
//     const {data: questions} = api.project.getQuestions.useQuery({
//         projectId
//     })

//     const [questionIndex, setQuestionIndex] = React.useState<number>(0)
//     const question = questions?.[questionIndex]

//   return (
//     <Sheet>
//         <AskQuestionCard/>
//         <div className=' h-4'></div>
//         <h1 className='text-xl font-semibold'>Saved Questions</h1>
//         <div className="h-2"></div>
//         <div className='flex flex-col gap-2'>
//             {questions?.map((question,index) => {
//                 return <React.Fragment key={index}>
//                     <SheetTrigger onClick={()=> setQuestionIndex(index)}>
//                         <div className='flex items-center gap-4 bg-white rounded-lg p-4 shadow border'>
//                             <img src={question.user.imageUrl ?? ""} alt={question.user.firstName??"" + question.user.lastName??""} className='rounded-full' height={30} width={30} />

//                             <div className='text-left flex flex-col'>
//                                 <div className='flex items-center gap-2'>
//                                     <p className='text-gray-700 line-clamp-1 text-lg font-medium'>
//                                         {question.question}
//                                     </p>
//                                     <span className='text-xs text-gray-400 whitespace-nowrap'>
//                                         {question.createdAt.toLocaleDateString()}
//                                     </span>
//                                     <p className='text-sm line-clamp-1 text-gray-500'>
//                                         {question.answer}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     </SheetTrigger>
//                 </React.Fragment>
//             })}
//         </div>
//     </Sheet>
//   )
// }

// export default QAPage