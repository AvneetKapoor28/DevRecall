"use client";

import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TabsContent } from "@radix-ui/react-tabs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  a11yDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import React from "react";
import { useTheme } from "next-themes";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type Props = {
  filesReferences: { fileName: string; sourceCode: string; summary: string }[];
};

const CodeReferences = ({ filesReferences }: Props) => {
  const { theme } = useTheme();
  const [tab, setTab] = React.useState(filesReferences[0]?.fileName || "");
  const [open, setOpen] = React.useState(false);

  if (filesReferences.length === 0) return null;

  // Always compute the index based on the current tab
  const fileIndex = filesReferences.findIndex((file) => file.fileName === tab);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <div className="max-w-[70vw]">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="bg-code-references-tab scrollbar-hidden flex flex-col gap-2 overflow-auto rounded-md p-1">
            {filesReferences.map((file) => (
              <DrawerTrigger asChild key={file.fileName}>
                <button
                  onClick={() => {
                    setTab(file.fileName);
                    setOpen(true); // manually open drawer *after* state set
                  }}
                  className={cn(
                    "text-muted-foreground hover:bg-muted rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                    {
                      "bg-primary text-primary-foreground":
                        tab === file.fileName,
                    },
                  )}
                >
                  {file.fileName}
                </button>
              </DrawerTrigger>
            ))}
          </div>
        </Tabs>
      </div>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-lg">{filesReferences[fileIndex]?.fileName}</DrawerTitle>
          <DrawerDescription className="text-muted-foreground">
            {filesReferences[fileIndex]?.summary}
          </DrawerDescription>
        </DrawerHeader>
        <SyntaxHighlighter
          language="typescript"
          style={theme === "dark" ? a11yDark : oneLight}
        >
          {String(filesReferences[fileIndex]?.sourceCode ?? "")}
        </SyntaxHighlighter>
      </DrawerContent>
    </Drawer>
  );
};

export default CodeReferences;
