import * as pdfjsLib from 'pdfjs-dist/webpack';

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Utility function to extract text from a PDF file.
 * @param {File} file - The PDF file to be parsed (browser File object).
 * @returns {Promise<string>} - Resolves with the extracted text from the PDF.
 * @throws {Error} - If parsing fails or content is empty.
 */
export async function parsePDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer(); // Read the file as an ArrayBuffer

    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    console.log('PDF loaded. Number of pages:', pdf.numPages);

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Extract and join all text items on the page
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n'; // Separate pages with a newline
    }

    // Ensure the parsed text is not empty
    if (!fullText.trim()) {
      throw new Error('Parsed content is empty.');
    }

    console.log('Parsed text from PDF:', fullText);
    return fullText.trim(); // Return the parsed text
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Unable to parse PDF. Please ensure the file is valid.');
  }
}







