import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  AIMessagePromptTemplate,
} from 'langchain/prompts';
import { LLMChain } from 'langchain';

const SYSTEM_PROMPT = `
  Anda adalah asisten AI yang membantu user untuk berkonsultasi terkait legal dan hukum yang sesuai dengan regulasi Pemerintah Indonesia.
  Jika Anda tidak tahu jawabannya, katakan saja bahwa Anda tidak tahu. JANGAN mencoba membuat jawaban palsu.
  Jawablah secara ramah dan friendly, tetapi tetap elegan dan sopan.
  Jika user ingin berkonsultasi lebih lanjut atau ingin konsultasi dengan manusia atau ahlinya, bisa diarahkan ke Legal Expert kami di [Arjun Sumarlan](https://wa.me/6281911125599)`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

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
    const pastMessages = history.map((message: string, i: number) => {
      if (i % 2 === 0 && typeof message === 'string') {
        return HumanMessagePromptTemplate.fromTemplate(message);
      } else if (typeof message === 'string') {
        return AIMessagePromptTemplate.fromTemplate(message);
      }
    });

    const systemMessagePrompt =
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT);
    const humanTemplate = '{text}';
    const humanMessagePrompt =
      HumanMessagePromptTemplate.fromTemplate(humanTemplate);

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      systemMessagePrompt,
      ...pastMessages,
      humanMessagePrompt,
    ]);

    const chat = new ChatOpenAI({
      temperature: 0,
    });

    const chain = new LLMChain({
      llm: chat,
      prompt: chatPrompt,
    });

    const result = await chain.call({
      text: sanitizedQuestion,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
