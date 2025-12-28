// Trust Scan AI Provider (Ollama backend)
// Powered by UndeadList

import { ScanResult, AIAnalysis } from './types';
import { buildAnalysisPrompt } from './ai';

// Ollama API response type
interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
}

// Get Ollama configuration from environment
export function getOllamaConfig() {
  return {
    serverUrl: process.env.OLLAMA_SERVER_URL || '',
    model: process.env.OLLAMA_MODEL || 'deepseek-coder-v2:16b',
  };
}

// Check if Ollama server is configured
export function hasOllamaConfig(): boolean {
  return !!process.env.OLLAMA_SERVER_URL;
}

// Parse Ollama-specific errors into user-friendly messages
function parseOllamaError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'AI analysis failed';
  }
  const message = error.message;

  if (message.includes('ECONNREFUSED') || message.includes('fetch failed')) {
    return 'AI analysis server is not available. Please try again later.';
  }
  if (message.includes('timeout') || message.includes('AbortError')) {
    return 'Analysis timed out. The server may be busy. Please try again.';
  }
  if (message.includes('model')) {
    return 'AI model not available. Please try again later.';
  }
  if (message.length < 100) {
    return message;
  }
  return 'AI analysis failed. Please try again.';
}

// Main analysis function - calls Ollama /api/generate endpoint
export async function analyzeWithOllama(scanResult: ScanResult): Promise<AIAnalysis> {
  const config = getOllamaConfig();

  if (!config.serverUrl) {
    throw new Error('AI analysis is not configured');
  }

  const prompt = buildAnalysisPrompt(scanResult);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const response = await fetch(`${config.serverUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        prompt: prompt + '\n\nRespond with JSON only, no markdown formatting.',
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 1024,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const data: OllamaGenerateResponse = await response.json();
    const text = data.response?.trim();

    if (!text) {
      throw new Error('No response from Trust Scan LLM');
    }

    // Parse JSON, handling potential markdown code blocks
    let jsonText = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    // Try to find JSON object if response has extra text
    const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonText = jsonObjectMatch[0];
    }

    const analysis = JSON.parse(jsonText) as AIAnalysis;
    return analysis;
  } catch (error) {
    throw new Error(parseOllamaError(error));
  }
}
