/**
 * Browser-based document text extraction.
 * Supports PDF, TXT, MD, and other plain-text formats.
 */

const MAX_TEXT_LENGTH = 50_000; // ~12k tokens, fits in most model contexts

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf')) {
    return extractPdfText(file);
  }

  if (
    name.endsWith('.txt') ||
    name.endsWith('.md') ||
    name.endsWith('.csv') ||
    name.endsWith('.json') ||
    name.endsWith('.xml') ||
    name.endsWith('.html') ||
    name.endsWith('.htm') ||
    file.type.startsWith('text/')
  ) {
    const text = await file.text();
    return text.slice(0, MAX_TEXT_LENGTH);
  }

  throw new Error(`Unsupported file type: ${name.split('.').pop()}`);
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Disable worker to avoid bundling issues with Next.js static export
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  const pages: string[] = [];
  let totalLength = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    if (totalLength >= MAX_TEXT_LENGTH) break;

    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: Record<string, unknown>) => ('str' in item ? item.str : ''))
      .join(' ');

    pages.push(pageText);
    totalLength += pageText.length;
  }

  return pages.join('\n\n').slice(0, MAX_TEXT_LENGTH);
}

export function isTextExtractable(fileName: string): boolean {
  const name = fileName.toLowerCase();
  return (
    name.endsWith('.pdf') ||
    name.endsWith('.txt') ||
    name.endsWith('.md') ||
    name.endsWith('.csv') ||
    name.endsWith('.json') ||
    name.endsWith('.xml') ||
    name.endsWith('.html') ||
    name.endsWith('.htm')
  );
}
