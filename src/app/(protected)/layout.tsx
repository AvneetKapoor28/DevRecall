import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { AppSidebar } from "./app-sidebar";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover";
import { CommandMenu } from "@/components/command-dialog";

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <CommandMenu></CommandMenu>
      <AppSidebar />
      <main className="m-2 w-full">
        <div className="border-sidebar-border bg-sidebar flex items-center gap-2 rounded-md border p-2 px-4 shadow">
          {/* <SearchBar/> */}
          <Popover>
            <PopoverTrigger asChild>
              <Info />
            </PopoverTrigger>
            <PopoverContent side="right" sideOffset={10} align="start" className="w-full">
              <h2 className="text-2xl font-bold">How to use</h2>
              <div className="h-4"></div>
              {[
                {
                  title: "🚀 Create Project",
                  items: [
                    "Enter the GitHub URL of a public repository (must have a main branch).",
                    "Project setup may take a few minutes depending on repo size.",
                    <>All your projects appear in the <b>sidebar</b>.</>,
                  ],
                },
                {
                  title: "📊Dashboard",
                  items: [
                    <>View the latest <b>10 commits</b> with AI-generated summaries.</>,
                    <>Access <b>Ask Questions</b> and <b>Summarize Meeting</b> directly.</>,
                    <> <b>Invite members</b> to collaborate on shared projects.</>,
                  ],
                },
                {
                  title: "💬 Q&A",
                  items: [
                    <>Ask questions about your codebase (e.g., "How does user authentication work?").</>,
                    <> <b>Save answers</b> to build your knowledge base.</>,
                    <>See which files were referenced—click any to view with a <b>Code Summary</b>.</>,
                  ],
                },
                {
                  title: "📁 Meetings",
                  items: [
                    "Upload recorded meetings for processing.",
                    <>Get a breakdown of <b>topics discussed.</b></>,
                    "Processing may take a few moments.",
                  ],
                },
              ].map((section, idx, arr) => (
                <React.Fragment key={section.title}>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold">{section.title}</h3>
                    <ul className="list-disc pl-6">
                      {section.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  {idx < arr.length - 1 && (
                    <>
                      <div className="h-2"></div>
                      <hr />
                      <div className="h-2"></div>
                    </>
                  )}
                </React.Fragment>
              ))}


            </PopoverContent>
          </Popover>
          <div className="ml-auto"></div>
          <UserButton />
        </div>
        <div className="h-4"></div>
        {/* main content */}
        <div className="border-sidebar-border bg-sidebar h-[calc(100vh-6rem)] overflow-y-auto rounded-md border p-4 shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
