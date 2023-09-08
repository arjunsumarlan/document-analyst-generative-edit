import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

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

async function generatePDF(html: string) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setContent(html);
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
  });

  await browser.close();
  return pdf;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { rawData } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!rawData) {
    return res.status(400).json({ message: 'No query in the request' });
  }

  try {
    const html = await textToHtml(rawData);
    const pdf = await generatePDF(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=your_nda_doc.pdf');
    res.status(200).send(pdf);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
