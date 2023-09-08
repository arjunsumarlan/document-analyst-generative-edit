import type { NextApiRequest, NextApiResponse } from 'next';
import { AutoGPT } from "langchain/experimental/autogpt";
import { ReadFileTool, WriteFileTool, SerpAPI } from "langchain/tools";
import { NodeFileStore } from "langchain/stores/file/node";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { query } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!query) {
    return res.status(400).json({ message: 'No query in the request' });
  }

  try {
    const store = new NodeFileStore();

    const tools = [
    new ReadFileTool({ store }),
    new WriteFileTool({ store }),
    new SerpAPI('efd66540f2e4088b9ce444ea1d459f319198788ef6b9b5b370ac984fa5ae8725', {
        location: "Indonesia",
        hl: "id",
        gl: "id",
    })];

    const vectorStore = new HNSWLib(new OpenAIEmbeddings(), {
        space: "cosine",
        numDimensions: 1536,
    });

    const autogpt = AutoGPT.fromLLMAndTools(
        new ChatOpenAI({ temperature: 0 }),
        tools,
        {
            memory: vectorStore.asRetriever(),
            aiName: "Tom",
            aiRole: "Assistant",
        }
    );

    const response = await autogpt.run(["Apak"]);

    const result = {
      rawData: response
    };
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(result);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
