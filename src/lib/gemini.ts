import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScanResult, AIAnalysis, GeminiAnalysis } from './types';
import { buildAnalysisPrompt } from './ai';

// Get the appropriate API key (server env takes priority)
export function getGeminiApiKey(clientKey?: string | null): string | null {
  // Server-side env var takes priority
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  // Fall back to client BYOK
  return clientKey || null;
}

// Check if server has a configured key
export function hasServerGeminiKey(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

function parseGeminiError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'AI analysis failed';
  }

  const message = error.message;

  // Rate limit error (429)
  if (message.includes('429') || message.includes('rate-limit') || message.includes('quota')) {
    return 'Rate limit reached. Please wait a minute and try again.';
  }

  // Invalid API key
  if (message.includes('401') || message.includes('API_KEY_INVALID') || message.includes('unauthorized')) {
    return 'Invalid API key. Please check your Gemini API key.';
  }

  // Model not found or access denied
  if (message.includes('404') || message.includes('not found')) {
    return 'AI model not available. Please try again later.';
  }

  // Network/timeout errors
  if (message.includes('network') || message.includes('timeout') || message.includes('ECONNREFUSED')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Generic server error
  if (message.includes('500') || message.includes('503')) {
    return 'Gemini service temporarily unavailable. Please try again later.';
  }

  // If it's a short message, show it directly
  if (message.length < 100) {
    return message;
  }

  // Default fallback for long/complex errors
  return 'AI analysis failed. Please try again.';
}

export async function analyzeWithGemini(
  apiKey: string,
  scanResult: ScanResult
): Promise<AIAnalysis> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  });

  const prompt = buildAnalysisPrompt(scanResult);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No response from Gemini');
    }

    const analysis = JSON.parse(text) as AIAnalysis;
    return analysis;
  } catch (error) {
    throw new Error(parseGeminiError(error));
  }
}

// Validate API key format
export function isValidGeminiKey(key: string): boolean {
  // Gemini API keys are typically 39 characters
  return /^[A-Za-z0-9_-]{35,45}$/.test(key.trim());
}
