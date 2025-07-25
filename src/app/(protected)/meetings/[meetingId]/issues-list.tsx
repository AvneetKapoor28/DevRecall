"use client";
import { FadeInUp } from "@/components/fade-up";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { api, type RouterOutputs } from "@/trpc/react";
// import { DialogContent, DialogDescription } from "@radix-ui/react-dialog";
import { Video} from "lucide-react";
import React from "react";

type Props = {
  meetingId: string;
};

const IssuesList = ({ meetingId }: Props) => {
  const { data: meeting, isLoading } = api.project.getMeetingById.useQuery(
    { meetingId },
    { refetchInterval: 4000 },
  );

  {
    if (isLoading || !meeting) return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-2l mx-auto flex items-center justify-between gap-x-8 border-b pb-6 lg:mx-0 lg:max-w-none">
        <div className="flex items-center gap-x-6">
          <div className="rounded-full border bg-backround p-3">
            <Video className="h-6 w-6" />
          </div>
          <h1>
            <div className="text-sm leading-6 text-gray-600">
              Meeting on {meeting.createdAt.toLocaleDateString()}
            </div>
            <div className="mt-1 text-2xl leading-6 font-semibold text-foreground">
              {meeting.name}
            </div>
          </h1>
        </div>
      </div>
      <div className="h-4"></div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {meeting.issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
};

function IssueCard({issue,}: {issue: NonNullable<RouterOutputs["project"]["getMeetingById"]>["issues"][number];}) {
    const [open, setOpen] = React.useState(false);
  return (
    <FadeInUp>
      <>
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {issue.gist}
                </DialogTitle>
                <DialogDescription>
                    {issue.createdAt.toLocaleDateString()} 
                </DialogDescription>
                <p className="text-gray-600">
                    {issue.headline}
                </p>
                <blockquote className="mt-2 border-1-4 border-gray-300 bg-border p-4 rounded-sm">
                    <span className="text-sm text-gray-600">{issue.start} - {issue.end}</span>
                    <p className="font-medium italic leading-relaxed text-secondary-foreground">{issue.summary}</p>
                </blockquote>
            </DialogHeader>
        </DialogContent>
    </Dialog>

    
      <Card className="relative">
        <CardHeader>
          <CardTitle className="text-xl">
            {issue.gist}
          </CardTitle>
            <div className="border-b"></div>
            <CardDescription>{issue.headline}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button  onClick={() => setOpen(true)}>
            Details
          </Button>
        </CardContent>{" "}
      </Card>
    </>
    </FadeInUp>
  );
}

export default IssuesList;
