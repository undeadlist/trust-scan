// Claude AI Provider
import Anthropic from '@anthropic-ai/sdk';
import { ScanResult, AIAnalysis } from './types';
import { buildAnalysisPrompt } from './ai';

// Get the appropriate API key (server env takes priority)
export function getClaudeApiKey(clientKey?: string | null): string | null {
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  return clientKey || null;
}

// Check if server has a configured key
export function hasServerClaudeKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function parseClaudeError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'AI analysis failed';
  }

  const message = error.message;

  // Rate limit error (429)
  if (message.includes('429') || message.includes('rate_limit') || message.includes('quota')) {
    return 'Rate limit reached. Please wait a minute and try again.';
  }

  // Invalid API key
  if (message.includes('401') || message.includes('authentication') || message.includes('invalid_api_key')) {
    return 'Invalid API key. Please check your Anthropic API key.';
  }

  // Model not found or access denied
  if (message.includes('404') || message.includes('not_found')) {
    return 'AI model not available. Please try again later.';
  }

  // Network/timeout errors
  if (message.includes('network') || message.includes('timeout') || message.includes('ECONNREFUSED')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Overloaded
  if (message.includes('overloaded') || message.includes('529')) {
    return 'Claude is currently overloaded. Please try again in a moment.';
  }

  // Generic server error
  if (message.includes('500') || message.includes('503')) {
    return 'Claude service temporarily unavailable. Please try again later.';
  }

  // If it's a short message, show it directly
  if (message.length < 100) {
    return message;
  }

  return 'AI analysis failed. Please try again.';
}

export async function analyzeWithClaude(
  apiKey: string,
  scanResult: ScanResult
): Promise<AIAnalysis> {
  const anthropic = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true, // Safe for BYOK - user provides their own key
  });

  const prompt = buildAnalysisPrompt(scanResult);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt + '\n\nRespond with JSON only, no markdown formatting.',
        },
      ],
    });

    // Extract text content from response
    const textContent = message.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No response from Claude');
    }

    const text = textContent.text.trim();

    // Try to extract JSON from the response (handle potential markdown code blocks)
    let jsonText = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    const analysis = JSON.parse(jsonText) as AIAnalysis;
    return analysis;
  } catch (error) {
    throw new Error(parseClaudeError(error));
  }
}

// Validate Claude API key format
export function isValidClaudeKey(key: string): boolean {
  // Claude API keys start with 'sk-ant-' and are typically 100+ characters
  const trimmedKey = key.trim();
  return /^sk-ant-[a-zA-Z0-9_-]{80,}$/.test(trimmedKey);
}
