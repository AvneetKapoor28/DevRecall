import {AssemblyAI} from 'assemblyai'
import { start } from 'repl'

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_AI_KEY!
})

function msToTime(ms:number) {
    const seconds = ms/1000
    const minutes = Math.floor(seconds/60)
    const remainingSeconds = Math.floor(seconds % 60)

    return `${minutes.toString().padStart(2,'0')}:${remainingSeconds.toString().padStart(2,'0')}`
}

export const processMeeting = async (meetingUrl: string) => {
    const transcript = await client.transcripts.transcribe({
        audio: meetingUrl,
        auto_chapters: true
    })

    const summaries = transcript.chapters?.map(chapter => ({
        start: msToTime(chapter.start),
        end: msToTime(chapter.end),
        gist: chapter.gist,
        headline: chapter.headline,
        summary: chapter.summary,
    })) || []

    if(!transcript.text) {
        throw new Error('Transcript text is empty')
    }

    return {
        summaries
    }
}

const audioFile = 'https://assembly.ai/wildfires.mp3'

const response = await processMeeting(audioFile)
console.log(response)