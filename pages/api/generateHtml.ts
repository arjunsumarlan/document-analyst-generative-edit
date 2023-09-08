import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from "langchain/llms/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

function formatToHtml(text: string) {
  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (const line of lines) {
    if (line.startsWith('- ')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${line.substring(2)}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p>${line}</p>`;
    }
  }

  // Close the list if the text ends while inside a list
  if (inList) {
    html += '</ul>';
  }

  return html;
}

async function textToHtml(text: string) {
  const htmlContent = formatToHtml(text);

  const fullHtml = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 16px;
            line-height: 1.6;
          }
          p {
            margin: 16px 0;
            text-align: justify;
          }
          ul {
            margin: 16px 0;
            padding-left: 40px;
          }
          li {
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  return fullHtml;
}

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
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuery = query.trim().replaceAll('\n', ' ');

  try {
    const llm = new OpenAI({ maxTokens: 2000 });
    const prompt = PromptTemplate.fromTemplate('Buatkan dokumen NON-DISCLOSURE AGREEMENT (NDA) berdasarkan data data berikut : {data} serta sesuai dengan standard dan regulasi pemerintah Indonesia');

    const chain = new LLMChain({
      llm,
      prompt
    });

    // Run is a convenience method for chains with prompts that require one input and one output.
    const response = await chain.run(sanitizedQuery);
    console.log('response', response);

    const html = await textToHtml(response);
    const result = {
      html: html,
      rawData: response
    };
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(result);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
