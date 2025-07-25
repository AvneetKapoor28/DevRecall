'use client'
import { api } from "@/trpc/react";
import React from "react";
import MeetingCard from "../dashboard/meeting-card";
import useProject from "@/hooks/use-project";
import { divider } from "@uiw/react-md-editor";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Delete, LucideDelete, Trash, Trash2, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";
import { FadeInUp } from "@/components/fade-up";

const MeetingsPage = () => {
  const { projectId } = useProject();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    { projectId },
    { refetchInterval: 4000 },
  );
  const deleteMeeting = api.project.deleteMeeting.useMutation()
  const refetch = useRefetch()
  return (
    <FadeInUp>
      <MeetingCard />
      <div className="h-6"></div>
      <h1 className="font-semibold text-xl">Meetings</h1>
      {meetings && meetings.length === 0 && <div>No meetings found</div>}
      {isLoading && <div>Loading...</div>}
      <ul className="divide-y divide-gray-200">
        {meetings?.map(meeting => (
          <li key={meeting.id} className="flex justify-between items-center py-5 gap-x-6">
            <div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/meetings/${meeting.id}`} className="text-sm font-semibold">{meeting.name}</Link>
                  {meeting.status === 'PROCESSING' && (
                    <Badge className="bg-yellow-500 text-white">Processing...</Badge>
                  )}

                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500 gap-x-2">
                <p className="whitespace-nowrap">{meeting.createdAt.toLocaleDateString()}</p>
                <p className="truncate">{meeting.issues.length} issues</p>
              </div>
            </div>
            <div className="flex items-center flex-none gap-x-4">
              <Link href={`/meetings/${meeting.id}`}>
              <Button className="cursor-pointer" variant={"outline"} disabled={meeting.status === 'PROCESSING'} size='sm'> View Meeting</Button>
              </Link>
              <Button size='sm' disabled={deleteMeeting.isPending} variant={"destructive"} onClick={()=> deleteMeeting.mutate({meetingId: meeting.id}, {
                onSuccess: ()=>{
                  toast.success("Meeting deleted successfully!");
                  refetch()
                }
              })}> <Trash2/> </Button>
            </div>
          </li>
        ))}</ul>
    </FadeInUp>
  );
};

export default MeetingsPage;
