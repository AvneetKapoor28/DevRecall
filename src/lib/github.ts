import { db } from "@/server/db";
import {Octokit} from "octokit"
import axios from "axios";
import { aiSummariseCommit } from "./gemini";
import type { any } from "zod";

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

type Response = {
    commitMessage: string,
    commitHash: string,
    commitAuthorName: string,
    commitAuthorAvatar: string,
    commitDate: string
}


export const getCommitHashes = async (github_url: string): Promise<Response[]> =>{
    const [owner, repo] = github_url.split('/').slice(-2);
    if(!owner || !repo) {
        throw new Error("Invalid GitHub URL");
    }
    const {data} = await octokit.rest.repos.listCommits({

        owner: owner,
        repo: repo,
    })
    
    const sortedCommits = data.sort((a:any, b:any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())
    return sortedCommits.slice(0, 10).map((commit: any) => ({
        commitHash: commit.sha as string,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit?.author?.name ?? "",
        commitAuthorAvatar: commit.author?.avatar_url ?? "",
        commitDate: commit.commit?.author?.date ?? "",

    }))
}


export const pollCommits = async(projectId: string)=>{
    const {project, githubUrl} = await fetchProjectGithubUrl(projectId);
    const commithashes = await getCommitHashes(githubUrl); 
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commithashes);
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map((commit : any, index)=>{
        console.log(`summarising commit: ${index} in POLLCOMMITS FUNCTION`)
        return summariseCommit(githubUrl, commit.commitHash)
    }))
    const summaries = summaryResponses.map((response: any) =>{
        
        if(response.status === "fulfilled"){
            return response.value as string
        }
        return ""
    })

    const commits = await db.commit.createMany({
        data: summaries.map((summary,index)=>{
            console.log(" Processing commit: ", index)
            return {
                projectId: projectId,
                commitHash: unprocessedCommits[index]!.commitHash,
                commitMessage: unprocessedCommits[index]!.commitMessage,
                commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
                commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
                commitDate: unprocessedCommits[index]!.commitDate,
                summary
            }
        })
    })
    return commits
}

async function summariseCommit(githubUrl: string, commitHash: string) {
    const {data} = await axios.get(`${githubUrl}/commit/${commitHash}.diff`,{
  headers: {
    Accept: 'application/vnd.github.v3.diff',
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}` // ← must be set in your .env or config
  }
})
    // console.log(`URL : ${githubUrl}/commit/${commitHash}.diff`)

    return await aiSummariseCommit(data) ||"";
}

async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: {
            id: projectId,
        },
        select:{
            githubUrl: true,
        }
    })
    if(!project?.githubUrl){
        throw new Error("Project not found or does not have a GitHub URL");
    }
    return {
        project,
        githubUrl: project.githubUrl
    }
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: {projectId}
    })

    const unprocessedCommits = commitHashes.filter((commit) => !processedCommits.some((processedCommit) => processedCommit.commitHash === commit.commitHash));
    return unprocessedCommits
}
