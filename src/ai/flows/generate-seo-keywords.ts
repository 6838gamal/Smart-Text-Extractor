'use server';

/**
 * @fileOverview An AI agent to generate SEO keywords from text.
 *
 * - generateSeoKeywords - A function that handles the keyword generation process.
 * - GenerateSeoKeywordsInput - The input type for the generateSeoKeywords function.
 * - GenerateSeoKeywordsOutput - The return type for the generateSeoKeywords function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSeoKeywordsInputSchema = z.object({
  text: z.string().describe('The text to generate keywords from.'),
});
export type GenerateSeoKeywordsInput = z.infer<typeof GenerateSeoKeywordsInputSchema>;

const GenerateSeoKeywordsOutputSchema = z.object({
  keywords: z.array(z.string()).describe('A list of SEO keywords.'),
});
export type GenerateSeoKeywordsOutput = z.infer<typeof GenerateSeoKeywordsOutputSchema>;

export async function generateSeoKeywords(
  input: GenerateSeoKeywordsInput
): Promise<GenerateSeoKeywordsOutput> {
  return generateSeoKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSeoKeywordsPrompt',
  input: { schema: GenerateSeoKeywordsInputSchema },
  output: { schema: GenerateSeoKeywordsOutputSchema },
  prompt: `You are an SEO expert. Generate a list of relevant SEO keywords based on the following text. Provide only the keywords, without any extra formatting or explanations.\n\nText: {{{text}}}`,
});

const generateSeoKeywordsFlow = ai.defineFlow(
  {
    name: 'generateSeoKeywordsFlow',
    inputSchema: GenerateSeoKeywordsInputSchema,
    outputSchema: GenerateSeoKeywordsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
