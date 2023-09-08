import multer from 'multer';
import { diffWords } from 'diff';
import { StandardFonts } from 'pdf-lib';
const { PDFDocument, rgb } = require('pdf-lib');
const pdf = require('pdf-parse');

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: any, res: any) => {
  try {
    upload.fields([{ name: 'pdfFileOriginal' }, { name: 'pdfFileCompare' }])(
      req,
      res,
      async (err) => {
        if (err) {
          console.error('Error uploading files:', err);
          res.status(500).json({ error: 'Error uploading files' });
          return;
        }

        try {
          const pdfOriginalBuffer = req.files.pdfFileOriginal[0].buffer;
          const pdfCompareBuffer = req.files.pdfFileCompare[0].buffer;

          const dataPdf1Text = await pdf(pdfOriginalBuffer, { normalizeWhitespace: true, disableCombineTextItems: true });
          const pdf1Text = dataPdf1Text.text;
          const dataPdf2Text = await pdf(pdfCompareBuffer, { normalizeWhitespace: true, disableCombineTextItems: true });
          const pdf2Text = dataPdf2Text.text;

          // Calculate the differences between the texts
          const differences = diffWords(pdf1Text, pdf2Text);
          console.log(pdfOriginalBuffer.toString());

          // // Create a multi-page PDF document for the output
          // const multiPagePdf = await PDFDocument.create();

          // // Initialize variables for page and x position
          // const helveticaFont = await multiPagePdf.embedFont(
          //   StandardFonts.Helvetica,
          // );
          // const fontSize = 12;
          // let currentPage;
          // let currentPageX = 50;
          // let currentPageY = 750;
          // const pageWidth = 595; // A4 page width
          // const pageHeight = 842; // A4 page height

          // // Compare PDFs and add content to pages
          // for (const change of differences) {
          //   const text = change.value;

          //   // Determine the color based on the type of change
          //   let color = rgb(0, 0, 0); // Default to black
          //   if (change.added) {
          //     color = rgb(0, 0, 1); // Blue for added text
          //   } else if (change.removed) {
          //     color = rgb(1, 0, 0); // Red for removed text
          //   }

          //   // Split the text into lines
          //   const lines = text.split('\n');

          //   for (const line of lines) {
          //     // Calculate the text width
          //     const textWidth = helveticaFont.widthOfTextAtSize(line, fontSize);

          //     // Check if adding this line would make the page go beyond the bottom
          //     const textHeight = fontSize; // Approximate text height
          //     if (
          //       !currentPage ||
          //       currentPageX + textWidth > pageWidth ||
          //       currentPageY - textHeight < 50
          //     ) {
          //       currentPage = multiPagePdf.addPage([pageWidth, pageHeight]); // A4 size
          //       currentPageY = 750;
          //       currentPageX = 50;
          //     }

          //     currentPage.drawText(line, {
          //       x: !(change.added && change.removed) ? currentPageX + 2 : currentPageX,
          //       y: currentPageY,
          //       size: fontSize,
          //       font: helveticaFont,
          //       color,
          //     });

          //     // Adjust X position and Y position for the next line
          //     currentPageX += textWidth;
          //     if (line !== lines[lines.length - 1]) {
          //       currentPageY -= textHeight;
          //       currentPageX = 50;
          //     }
          //   }
          // }

          // const modifiedPdfBytes = await multiPagePdf.save();

          // res.setHeader('Content-Type', 'application/pdf');
          // res.setHeader(
          //   'Content-Disposition',
          //   'inline; filename=comparison.pdf',
          // );
          // res.status(200).end(modifiedPdfBytes);
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(differences);
        } catch (error) {
          console.error('Error comparing PDFs:', error);
          res.status(500).json({ error: 'Failed to compare PDFs' });
        }
      },
    );
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
