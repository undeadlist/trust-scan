import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
  });
}
