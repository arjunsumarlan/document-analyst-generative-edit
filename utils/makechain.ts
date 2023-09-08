import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { OpenAIAgentTokenBufferMemory, createConversationalRetrievalAgent } from "langchain/agents/toolkits";
import { ChatMessageHistory } from "langchain/memory";
import { AnalyticDBVectorStore } from 'langchain/vectorstores/analyticdb';
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { SerpAPI } from 'langchain/tools';
import { Calculator } from "langchain/tools/calculator";
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_TEMPLATE = `Silakan berikan saya percakapan dan pertanyaan lanjutan sehingga saya dapat membantu Anda mengubahnya menjadi pertanyaan mandiri.

Riwayat Chat:
{chat_history}
Masukan Tindak Lanjut: {question}
Pertanyaan Mandiri:`;

// Jika pertanyaannya tidak terkait dengan dokumen, jawablah dengan sopan bahwa Anda hanya dapat menjawab pertanyaan yang terkait dengan dokumen tersebut.
const QA_TEMPLATE = `Anda adalah asisten AI yang membantu. Gunakan dokumen & regulasi Pemerintah Indonesia untuk menjawab dan melakukan sesuatu pada dokumen sesuai yang diminta oleh user.
Jika Anda tidak tahu jawabannya, katakan saja bahwa Anda tidak tahu. JANGAN mencoba membuat jawaban palsu.

{context}

Pertanyaan: {question}
Jawaban yang membantu dalam format Markdown :`;

export const makeChain = (vectorstore: PineconeStore | AnalyticDBVectorStore, previousMessages: any[]) => {
  const model = new ChatOpenAI({
    temperature: 0,
    modelName: 'gpt-3.5-turbo',
  });
  const tools = [
    new SerpAPI(process.env.SERPAPI_API_KEY, {
      location: "Indonesia",
      hl: "id",
      gl: "id",
    }),
    new Calculator(),
  ];

  // const chatHistory = new ChatMessageHistory(previousMessages);

  // const memory = new OpenAIAgentTokenBufferMemory({
  //   llm: model,
  //   memoryKey: "chat_history",
  //   outputKey: "output",
  //   chatHistory,
  // });

  // const chain = initializeAgentExecutorWithOptions(tools, model, {
  //   agentType: "openai-functions",
  //   memory,
  //   returnIntermediateSteps: true,
  //   agentArgs: {
  //     // prefix: CONDENSE_TEMPLATE
  //     prefix: 'Do your best to answer the questions. Feel free to use any tools available to look up relevant information, only if necessary.',
  //   },
  // });




  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_TEMPLATE,
      questionGeneratorTemplate: CONDENSE_TEMPLATE,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );
  return chain;
};
