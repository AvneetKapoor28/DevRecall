'use client'

import { Tabs } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { TabsContent } from '@radix-ui/react-tabs'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {oneLight, a11yDark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import React from 'react'
import { useTheme } from 'next-themes'

type Props = {
    filesReferences: {fileName: string, sourceCode: string, summary: string}[]
}

const CodeReferences = ({filesReferences}: Props) => {
    const {theme} = useTheme()
    const [tab, setTab] = React.useState(filesReferences[0]?.fileName)
    if(filesReferences.length ===0) return null

  return (
    <div className="max-w-[70vw]">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex gap-2 overflow-x-scroll rounded-md bg-code-references-tab p-1 scrollbar-hidden">
          {filesReferences.map((file) => (
            <button
              key={file.fileName}
              onClick={() => setTab(file.fileName)}
              className={cn(
                "text-muted-foreground hover:bg-muted rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                { "bg-primary text-primary-foreground": tab === file.fileName },
              )}
            >
              {file.fileName}
            </button>
          ))}
        </div>
        {filesReferences.map(file => (
            <TabsContent key={file.fileName} value={file.fileName} className='max-h-[30vh]  overflow-scroll scrollbar-hidden max-w-7xl rounded-md'>
                <SyntaxHighlighter language='typescript' style={theme ==='dark' ? a11yDark : oneLight}>
                    {file.sourceCode}
                </SyntaxHighlighter>
            </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default CodeReferences