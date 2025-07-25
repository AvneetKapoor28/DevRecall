"use client";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";

const CommitLog = () => {
  const { projectId, project } = useProject();
  const { data: commits } = api.project.getCommits.useQuery({ projectId });
  return (
    <>
      <ul className="space-y-6">
        {commits?.map ((commit, commitIdx) => {
            return <li key={commit.id} className="relative flex gap-x-4">
                <div className={cn(commitIdx === commits.length-1? 'h-6': '-bottom-6', 'absolute top-0 left-0 flex justify-center w-6')}>
                    <div className="w-px translate-x-1 bg-gray-200"></div>
                </div>

                <>
                    <img src = {commit.commitAuthorAvatar} alt="author avatar" className="relative mt-4 size-8 flex-none rounded-full bg-gray-500" />
                    <div className="flex-auto rounded-md bg-card p-3 ring-1 ring-inset ring-commit-ring ">
                        {/* <p className="text-sm font-medium leading-6 text-gray-900"></p> */}
                        <div className="flex justify-between gap-x-4">
                            <Link target="_blank" href={`${project?.githubUrl}/commit/${commit.commitHash}`} className="py-0.5 text-xs leading-5 text-gray-500">
                                <span className="font-medium text-card-foreground">
                                    {commit.commitAuthorName} 
                                </span> {" "}
                                <span className="inline-flex items-center">
                                    commited
                                    <ExternalLink className="ml-1 size-4"/>
                                </span>
                            </Link>
                        </div>
                        <span className="font-semibold">
                            {commit.commitMessage}
                        </span>
                        <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-commit-summary">
                            {commit.summary}
                        </pre>
                    </div>
                </>
            </li>
        })}
      </ul>
    </>
  );
};

export default CommitLog;
