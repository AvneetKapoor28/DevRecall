"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadFile } from "@/lib/firebase";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Presentation, Upload } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const MeetingCard = () => {
  const { project } = useProject();
  const processMeeting = useMutation({mutationFn: async(data: {meetingUrl: string, projectId:string, meetingId: string})=>{
    const { meetingUrl, projectId, meetingId } = data;
    const response = await axios.post('/api/process-meeting', {meetingUrl, projectId, meetingId})
    return response.data;
  }})


  const router = useRouter();
  const [progress, setProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedfiles) => {
      if (!project) return;
      setIsUploading(true);
      console.log(acceptedfiles);
      const file = acceptedfiles[0];
      if (!file) return;
      const downloadUrl = (await uploadFile(
        file as File,
        setProgress,
      )) as string;
      uploadMeeting.mutate({
        projectId: project.id,
        meetingUrl: downloadUrl,
        name: file.name,
      }, {
        onSuccess: (meeting) => {
            toast.success("Meeting uploaded successfully!");
            router.push('/meetings')
            processMeeting.mutateAsync({meetingUrl: downloadUrl, projectId: project.id, meetingId: meeting.id})
        },
        onError: () =>{
            toast.error("Failed to upload meeting");
        }
      });

      setIsUploading(false);
    },
  });
  return (
    <Card
      className="col-span-2 flex flex-col items-center justify-center"
      {...getRootProps()}
    >
      {!isUploading && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-1 text-sm font-semibold text-foreground">
            Create New Meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyse you meeting with DevRecall
            <br />
            Powered by AI
          </p>
          <div className="mt-6">
            <Button disabled={isUploading}>
              <Upload className="mr-1.5 -ml-0.5 h-5 w-5" aria-hidden="true" />
              Upload Meeting Audio
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}
      {isUploading && (
        <div className="flex items-center justify-center">
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className="size-20"
            styles={buildStyles({
              pathColor: "var(--primary)",
              textColor: "var(--primary)",
              trailColor: "var(--primary)",
            })}
          />
          <p className="text-sm text-gray-500">Uploading you meeting...</p>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
