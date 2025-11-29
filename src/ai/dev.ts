import { config } from 'dotenv';
config();

import '@/ai/flows/translate-extracted-text.ts';
import '@/ai/flows/summarize-uploaded-text.ts';
import '@/ai/flows/generate-seo-keywords.ts';
import '@/ai/flows/extract-text.ts';
