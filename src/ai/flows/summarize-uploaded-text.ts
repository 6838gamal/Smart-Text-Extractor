'use server';

/**
 * @fileOverview A text summarization AI agent.
 *
 * - summarizeUploadedText - A function that summarizes text.
 * - SummarizeUploadedTextInput - The input type for the summarizeUploadedText function.
 * - SummarizeUploadedTextOutput - The return type for the summarizeUploadedText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeUploadedTextInputSchema = z.object({
  text: z.string().describe('The text to summarize.'),
});
export type SummarizeUploadedTextInput = z.infer<
  typeof SummarizeUploadedTextInputSchema
>;

const SummarizeUploadedTextOutputSchema = z.object({
  summary: z.string().describe('The summary of the text.'),
});
export type SummarizeUploadedTextOutput = z.infer<
  typeof SummarizeUploadedTextOutputSchema
>;

export async function summarizeUploadedText(
  input: SummarizeUploadedTextInput
): Promise<SummarizeUploadedTextOutput> {
  return summarizeUploadedTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeUploadedTextPrompt',
  input: {schema: SummarizeUploadedTextInputSchema},
  output: {schema: SummarizeUploadedTextOutputSchema},
  prompt: `Summarize the following text:\n\n{{{text}}}`,
});

const summarizeUploadedTextFlow = ai.defineFlow(
  {
    name: 'summarizeUploadedTextFlow',
    inputSchema: SummarizeUploadedTextInputSchema,
    outputSchema: SummarizeUploadedTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
