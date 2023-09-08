import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { AnalyticDBVectorStore } from "langchain/vectorstores/analyticdb";
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

export const config = {
  api: {
    bodyParser: false,
  },
};

const connectionOptions = {
  host: process.env.ANALYTICDB_HOST || "localhost",
  port: Number(process.env.ANALYTICDB_PORT) || 5432,
  database: process.env.ANALYTICDB_DATABASE || "your_database",
  table: 'langchain_document',
  user: process.env.ANALYTICDB_USERNAME || "username",
  password: process.env.ANALYTICDB_PASSWORD || "password",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm({
    uploadDir: path.join(process.cwd(), 'docs'), // Set the upload directory
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      res.status(500).json({ error: 'Error parsing form' });
      return;
    }

    try {
      /*load raw docs from the all files in the directory */
      const directoryLoader = new DirectoryLoader(path.join(process.cwd(), 'docs'), {
        '.pdf': (path) => new PDFLoader(path),
      });
  
      // const loader = new PDFLoader(filePath);
      const rawDocs = await directoryLoader.load();
  
      /* Split text into chunks */
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
  
      const docs = await textSplitter.splitDocuments(rawDocs);
      console.log('split docs', docs);
  
      console.log('creating vector store...');
      /*create and store the embeddings in the vectorStore*/
      const embeddings = new OpenAIEmbeddings();

      // /** Using AnalyticDB as Vector Store */
      // // const vectorStore = new AnalyticDBVectorStore(embeddings, {
      // //   connectionOptions,
      // // });
      // // await vectorStore.addDocuments(docs);

      // const vectorStore = await AnalyticDBVectorStore.fromDocuments(
      //   docs,
      //   embeddings,
      //   { connectionOptions }
      // );
  
      // // need to manually close the Connection pool
      // await vectorStore.end();
  
      /** Using Pinecone as Vector Store */
      const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name
  
      //embed the PDF documents
      await PineconeStore.fromDocuments(docs, embeddings, {
        pineconeIndex: index,
        namespace: PINECONE_NAME_SPACE,
        textKey: 'text',
      });
      console.log('ingestion complete');
      return res.status(200).json({ message: 'Your pdf file uploaded successfully' });
    } catch (error) {
      console.log('error', error);
      throw new Error('Failed to ingest your data');
    }
  });
}
