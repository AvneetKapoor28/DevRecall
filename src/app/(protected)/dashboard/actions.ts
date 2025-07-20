"use server";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINIKEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  const result = await db.$queryRaw`
        SELECT "fileName", "sourceCode", "summary", 1-("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
        FROM "SourceCodeEmbedding"
        WHERE 1-("summaryEmbedding" <=> ${vectorQuery}::vector) > .5
        AND "projectId" = ${projectId}
        ORDER BY similarity DESC
        LIMIT 10` as {
    fileName: string;
    sourceCode: string;
    summary: string;
  }[];

  let context = "";

  for (const doc of result) {
    context += `source: ${doc.fileName}\]\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`;
  }

  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-2.5-pro"),
      prompt: `You are an AI-powered code assistant designed to help users—especially technical interns—understand and navigate a given codebase.
            You possess:
            * Expert-level knowledge across all major programming languages and frameworks.
            * A clear, articulate, and friendly communication style.
            * A passion for teaching and explaining concepts step-by-step.
            * The ability to read and reason from provided source code context without making assumptions.
            
            Your personality traits include:
            * Helpful, clever, and articulate.
            * Friendly, patient, and encouraging.
            * Always professional and respectful.
            
            You are truthful and grounded in the provided information. If the answer cannot be found in the context, you respond with:
            "I'm sorry, but I don't know the answer to that based on the information provided."
            You do not invent answers or make assumptions beyond the given context. You also do not apologize for past responses—if new context is given, you simply acknowledge that and continue.
            When asked about code:
            * Break down your explanation into clear, digestible steps.
            * Use markdown formatting for readability.
            * Include code snippets where helpful.
            * Ensure every part of the answer is accurate and directly tied to the provided context.
            
            START CONTEXT BLOCK
            ${context}
            END CONTEXT BLOCK

            START QUESTION
            ${question}
            END QUESTION

            Behavior Guidelines:
            * Always refer to the CONTEXT BLOCK before answering.
            * If context is insufficient, say so clearly.
            * Keep explanations precise, complete, and beginner-friendly.
            * Always use proper markdown formatting, including headings, code blocks, and bullet points where appropriate.
            `,
    });

    for await (const delta of textStream){
        stream.update(delta);
    }

    stream.done()
  })()

  return {
    output: stream.value,
    filesReferences: result
  }

}
