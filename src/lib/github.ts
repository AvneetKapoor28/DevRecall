import { db } from "@/server/db";
import {Octokit} from "octokit"
import axios from "axios";
import { aiSummariseCommit } from "./gemini";

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


type CommitData = {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        } | null;
    };
    author: {
        avatar_url: string;
    } | null;
};

export const getCommitHashes = async (github_url: string): Promise<Response[]> =>{
    const [owner, repo] = github_url.split('/').slice(-2);
    if(!owner || !repo) {
        throw new Error("Invalid GitHub URL");
    }
    const {data} = await octokit.rest.repos.listCommits({

        owner: owner,
        repo: repo,
    })
    
    const sortedCommits = (data as CommitData[]).sort((a, b) => {
        const dateA = a.commit.author?.date ? new Date(a.commit.author.date).getTime() : 0;
        const dateB = b.commit.author?.date ? new Date(b.commit.author.date).getTime() : 0;
        return dateB - dateA;
    });
    return sortedCommits.slice(0, 10).map((commit) => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit?.author?.name ?? "",
        commitAuthorAvatar: commit.author?.avatar_url ?? "",
        commitDate: commit.commit?.author?.date ?? "",

    }));
};


export const pollCommits = async(projectId: string)=>{
    const {githubUrl} = await fetchProjectGithubUrl(projectId);
    const commithashes = await getCommitHashes(githubUrl); 
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commithashes);
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map((commit, index)=>{
        console.log(`summarising commit: ${index} in POLLCOMMITS FUNCTION`);
        return summariseCommit(githubUrl, commit.commitHash);
    }));
    const summaries = summaryResponses.map((response) =>{
        
        if(response.status === "fulfilled"){
            return response.value;
        }
        return "";
    });

    const commits = await db.commit.createMany({
        data: summaries.map((summary,index)=>{
            console.log(" Processing commit: ", index);
            return {
                projectId: projectId,
                commitHash: unprocessedCommits[index]!.commitHash,
                commitMessage: unprocessedCommits[index]!.commitMessage,
                commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
                commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
                commitDate: unprocessedCommits[index]!.commitDate,
                summary
            };
        })
    });
    return commits;
};

async function summariseCommit(githubUrl: string, commitHash: string) {
    const {data} = await axios.get<string>(`${githubUrl}/commit/${commitHash}.diff`,{
  headers: {
    Accept: 'application/vnd.github.v3.diff',
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}` // ← must be set in your .env or config
  }
});
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
    });
    if(!project?.githubUrl){
        throw new Error("Project not found or does not have a GitHub URL");
    }
    return {
        githubUrl: project.githubUrl
    };
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: {projectId}
    });

    const unprocessedCommits = commitHashes.filter((commit) => !processedCommits.some((processedCommit) => processedCommit.commitHash === commit.commitHash));
    return unprocessedCommits;
}
