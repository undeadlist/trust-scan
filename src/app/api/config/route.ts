import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    trustScanAvailable: !!process.env.OLLAMA_SERVER_URL,
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
  });
}
