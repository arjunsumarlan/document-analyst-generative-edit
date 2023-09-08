import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { OpenAIAgentTokenBufferMemory } from "langchain/agents/toolkits";
import { AnalyticDBVectorStore } from "langchain/vectorstores/analyticdb";
import { AIMessage, HumanMessage } from 'langchain/schema';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';

const connectionOptions = {
  host: process.env.ANALYTICDB_HOST || "localhost",
  port: Number(process.env.ANALYTICDB_PORT) || 5432,
  database: process.env.ANALYTICDB_DATABASE || "your_database",
  user: process.env.ANALYTICDB_USERNAME || "username",
  password: process.env.ANALYTICDB_PASSWORD || "password",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

  console.log('question', question);
  console.log('history', history);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    /* create vectorstore*/

    // /** Using Analytic DB as Vector Store */
    // const vectorStore = await AnalyticDBVectorStore.fromExistingIndex(
    //   new OpenAIEmbeddings({}),
    //   { connectionOptions }
    // );

    /** Using Pinecone as Vector Store */
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
      },
    );

    const pastMessages = history.map((message: string, i: number) => {
      if (i % 2 === 0) {
        return new HumanMessage(message);
      } else {
        return new AIMessage(message);
      }
    });

    //create chain
    const chain = await makeChain(vectorStore, pastMessages);

    //Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: pastMessages
    });

    console.log('response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
