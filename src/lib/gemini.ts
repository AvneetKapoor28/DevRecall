import { GoogleGenerativeAI } from "@google/generative-ai";
import {Document} from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINIKEY!);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const aiSummariseCommit = async (diff: string) => {
    // console.log("Generating commit summary for diff: ", diff);
  const response = await model.generateContent([
    `You are an expert programmer, and you are trying to summarise a git diff.
        Reminders about the git diff format: 
        For every file, there are a few metadata lines, like(for example):
        \`\`\`
        diff --git a/lib/index.js b/lib/index.js
        index addf691..bfef603 100644
        --- a/lib/index.js
        +++ b/lib/index.js
        \`\`\`
        This means that \`lib.index.js\` was modified in this commit. Note that this is only an example.
        Then there is a specifier of the lines that were modified.
        A line starting with \`+\` means it was added.
        A line starting with \`-\` means that line was deleted.
        A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding. It is not a part of the diff.
        [...]
        EXAMPLE SUMMARY COMMENTS:
        \`\`\`
        *Raised the amount of returned recordings from \`10\` to\`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
        *Fixed a typo in the github action name [.github/workflows/gpt-commit-summariser.yml]
        *Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
        *Added an OpenAI API for completions [packages/utils/apis/openai.ts]
        *Lowered numeric tolerance for test files
        \`\`\`
        Most commits will have less comments than this example list.
        The last commeent does not include the file names because there were more than two relevent files in the hypothetical commit.
        Do not include parts of the example in your summary, it is given only as an example of appropriate comments.`,
    `Please summarise the following diff file: \n\n${diff}`
  ]);
//   console.log(diff)
//   console.log("]\n\n-------------------------------------------------------------------------------------------------------------------------------------------------------------------\n\n")
//   console.log("AI SUMMARISE COMMIT RESPONSE: ", response.response.text());
    // console.log("AI SUMMARISE COMMIT RESPONSE: ", response.response.text());
  return response.response.text();
};

export async function summariseCode(doc: Document){
    console.log("Generating summary for: ", doc.metadata.source);
    try{
        const code = doc.pageContent.slice(0,10000);
        const response = await model.generateContent([
            `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects.`,
            `you are onboarding a new junior engineer and explaining to them the purpose of the ${doc.metadata.source} file.
            Here is the code: 
            ---
            ${code}
            ---
            Give a summary in no more than 100 words of the code above`
        ]);
        
        return response.response.text()
    }
    catch(e){
        console.log("Error in summariseCode: ", e);
        return ""
    }

}


export async function generateEmbedding(summary: string){
    const model = genAI.getGenerativeModel({model : "text-embedding-004"})
    const result = await model.embedContent(summary)
    const embedding = result.embedding
    return embedding.values
}

// console.log(await generateEmbedding("hello world"))