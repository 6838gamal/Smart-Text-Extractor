
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
  text: z.string().describe('The extracted text from the file.'),
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
  prompt: `You are a powerful and versatile text extraction engine. Your primary task is to extract any and all text from the provided file with the highest possible accuracy, regardless of its format (image, audio, video).

If the file is an image, perform Optical Character Recognition (OCR). Pay close attention to various fonts, scripts, and handwriting styles, including but not limited to cursive scripts like Arabic Ruq'ah. You should be able to read handwritten text even if it is not perfectly straight, just as a human would.

If the file is audio or video, transcribe the speech. You are an expert in linguistics and can understand and transcribe various local dialects and accents accurately.

Return only the extracted text, ensuring that the original language, dialect, and script are preserved.

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
