'use client'
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle,DialogContent} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useProject from '@/hooks/use-project';

import React from 'react'
import { toast } from 'sonner';

const InviteButton = () => {
    const { projectId } = useProject();
    const [open, setOpen] = React.useState(false);
    
  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle> Invite Team Members</DialogTitle>
            </DialogHeader>
            <p className='text-sm text-gray-500'>
                Ask them to paste this link in their browser
            </p>
            <Input className='mt-4' 
            readOnly
            onClick={()=> {
                navigator.clipboard.writeText(`${window.location.origin}/join/${projectId}`);
                toast.success("Link copied to clipboard")
            }} value={`${window.location.origin}/join/${projectId}`}>

            </Input>
        </DialogContent>
    </Dialog>

    <Button size='sm' className='cursor-pointer' onClick={()=>{setOpen(true)}}>Invite Members</Button>

    </>
  )
}

export default InviteButton