"use client";

import useProject from "@/hooks/use-project";
import { useUser } from "@clerk/nextjs";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import ArchiveButton from "./archive-button";
const InviteButton = dynamic(()=> import('./invite-button'), {ssr: false})
import TeamMembers from "./team-members";
import dynamic from "next/dynamic";
import { FadeInUp } from "@/components/fade-up";
import WaveText from "@/components/wave-text";

const DashboardPage = () => {
  const { project } = useProject();
  // if(!project?.id) {return (
  //   <div className="flex items-center justify-center h-full w-full">
  //     <WaveText text="Loading Your Project"/>
  //   </div>
  // )};
  return (
    <FadeInUp>
      <div>
      {/* {project?.id} */}
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* GITHUB LINK */}
        <div className="bg-primary w-fit rounded-md px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This project is linked to {""}
                <Link
                  href={project?.githubUrl ?? ""}
                  className="inline-flex items-center text-white/80 hover:underline"
                >
                  {project?.githubUrl}{" "}
                  {<ExternalLink className="ml-1 size-4" />}
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="h-4"></div>

        <div className="flex items-center gap-4">
          <TeamMembers/>
          <InviteButton/>
          <ArchiveButton/>
        </div>


      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard/>
          <MeetingCard/>
        </div>
      </div>

      <div className="mt-8">
        <CommitLog/>
      </div>
    </div>
    </FadeInUp>
  );
};

export default DashboardPage;
