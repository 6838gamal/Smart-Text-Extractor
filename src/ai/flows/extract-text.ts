
'use server';

/**
 * @fileOverview An AI agent to extract text from various file types.
 *
 * - extractText - A function that handles the text extraction process.
 * - ExtractTextInput - The input type for the extractText function.
 * - ExtractTextOutput - The return type for the extractText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractTextInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A file (image, audio, video) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextInput = z.infer<typeof ExtractTextInputSchema>;

const ExtractTextOutputSchema = z.object({
  isTable: z.boolean().describe('Whether the extracted content is a table.'),
  text: z.string().describe('The extracted text from the file. If it is a table, this should be the raw text content.'),
  csvData: z.string().optional().describe('If the content is a table, this should be the CSV representation of the table data.'),
});
export type ExtractTextOutput = z.infer<typeof ExtractTextOutputSchema>;

export async function extractText(
  input: ExtractTextInput
): Promise<ExtractTextOutput> {
  return extractTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTextPrompt',
  input: { schema: ExtractTextInputSchema },
  output: { schema: ExtractTextOutputSchema },
  prompt: `You are a powerful and versatile text extraction engine. Your primary task is to extract any and all text from the provided file with the highest possible accuracy.

Analyze the content of the file. If the content appears to be a table or a spreadsheet, set the 'isTable' flag to true. If 'isTable' is true, you MUST provide a CSV (Comma-Separated Values) representation of the table in the 'csvData' field. Each row of the table should be a new line in the CSV, and columns should be separated by commas. Make sure to handle commas within cells by enclosing the cell content in double quotes.

If the file is an image, perform Optical Character Recognition (OCR). Pay close attention to various fonts, scripts, and handwriting styles.

If the file is audio or video, transcribe the speech.

Always return the full extracted text, regardless of format, in the 'text' field.

File: {{media url=fileDataUri}}`,
});

const extractTextFlow = ai.defineFlow(
  {
    name: 'extractTextFlow',
    inputSchema: ExtractTextInputSchema,
    outputSchema: ExtractTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
