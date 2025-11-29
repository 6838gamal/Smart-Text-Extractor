'use server'

import { generateSeoKeywords } from '@/ai/flows/generate-seo-keywords'
import { summarizeUploadedText } from '@/ai/flows/summarize-uploaded-text'
import { translateExtractedText } from '@/ai/flows/translate-extracted-text'
import { extractText } from '@/ai/flows/extract-text'
import { z } from 'zod'

const summarySchema = z.object({
  text: z.string().min(1, 'النص لا يمكن أن يكون فارغًا.'),
})

export async function getSummary(values: z.infer<typeof summarySchema>) {
  const validatedFields = summarySchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'نص غير صالح.' }
  }

  try {
    const { summary } = await summarizeUploadedText({ text: validatedFields.data.text })
    return { summary }
  } catch (error) {
    console.error('Summarization Error:', error);
    return { error: 'فشل إنشاء الملخص. يرجى المحاولة مرة أخرى.' }
  }
}

const translateSchema = z.object({
  text: z.string().min(1, 'النص لا يمكن أن يكون فارغًا.'),
  targetLanguage: z.string().min(1, 'يجب تحديد اللغة الهدف.'),
})

export async function getTranslation(values: z.infer<typeof translateSchema>) {
  const validatedFields = translateSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'إدخال غير صالح.' }
  }
  
  try {
    const { translatedText } = await translateExtractedText(validatedFields.data)
    return { translatedText }
  } catch (error) {
    console.error('Translation Error:', error);
    return { error: `فشلت الترجمة إلى ${validatedFields.data.targetLanguage}. يرجى المحاولة مرة أخرى.` }
  }
}

const keywordsSchema = z.object({
  text: z.string().min(1, 'النص لا يمكن أن يكون فارغًا.'),
});

export async function getSeoKeywords(values: z.infer<typeof keywordsSchema>) {
  const validatedFields = keywordsSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'نص غير صالح.' };
  }

  try {
    const { keywords } = await generateSeoKeywords({ text: validatedFields.data.text });
    return { keywords };
  } catch (error) {
    console.error('SEO Keywords Error:', error);
    return { error: 'فشل إنشاء كلمات مفتاحية للسيو. يرجى المحاولة مرة أخرى.' };
  }
}

const extractSchema = z.object({
  fileDataUri: z.string().min(1, 'File data URI is required.'),
});

export async function getExtractedText(values: z.infer<typeof extractSchema>) {
  const validatedFields = extractSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid file data.' };
  }

  try {
    const output = await extractText({ fileDataUri: validatedFields.data.fileDataUri });
    return output;
  } catch (error) {
    console.error('Text Extraction Error:', error);
    return { error: 'فشل استخراج النص من الملف. قد يكون نوع الملف غير مدعوم من قبل النموذج.' };
  }
}
