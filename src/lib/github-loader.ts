import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { db } from "@/server/db";

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: ["node_modules",".git",".github",".vscode","package-lock.json","yarn.lock","pnpm-lock.yaml","bun.lock"],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
};

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
    const docs = await loadGithubRepo(githubUrl, githubToken)
    const allEmbeddings = await generateEmbeddings(docs)
    await Promise.allSettled(allEmbeddings.map(async (embedding, index)=>{
        console.log(`Processing ${index} of ${allEmbeddings.length}`)
        if(!embedding) return

        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
                summary: embedding.summary,
                sourceCode: embedding.sourceCode,
                fileName: embedding.fileName,
                projectId,
            }
        })
        await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}`
    }))
}

// const generateEmbeddings = async (docs: Document[]) => {
//     return await Promise.all(docs.map(async doc => {
//         const summary = await summariseCode(doc)
//         const embedding  = await generateEmbedding(summary)
//         console.log(`IN THE generateEmbeddings function:
//             Summary: ${summary}
//             --------------------------------------------
//             Embedding: ${embedding[0]}`)
//         return {
//             summary,
//             embedding,
//             sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
//             fileName: doc.metadata.source,
//         }
//     }))
// } 

//HAD TO INCLUDE RATE LIMITING TO AVOID GEMINI API RATE LIMITS
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const generateEmbeddings = async (docs: Document[]) => {
  const results = [];

  for (const doc of docs) {
    console.log(`Processing file: ${doc.metadata.source}`);
    
    const summary = await summariseCode(doc);
    const embedding = await generateEmbedding(summary);

    console.log(`IN THE generateEmbeddings function:
        Summary: ${summary}
        --------------------------------------------
        Embedding: ${embedding[0]}`);

    results.push({
      summary,
      embedding,
      sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
      fileName: doc.metadata.source,
    });

    // Wait for 4 seconds before the next API call
    await delay(4000);
  }

  return results;
};
