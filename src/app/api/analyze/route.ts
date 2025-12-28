// Server-side AI Analysis Endpoint
// Proxies requests to Trust Scan LLM (Ollama) to hide internal server details

import { NextRequest, NextResponse } from 'next/server';
import { ScanResult, AIAnalysis } from '@/lib/types';
import { analyzeWithOllama, hasOllamaConfig } from '@/lib/trustscan';

interface AnalyzeRequest {
  scanResult: ScanResult;
}

interface AnalyzeResponse {
  success: boolean;
  analysis?: AIAnalysis;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    // Verify AI server is configured
    if (!hasOllamaConfig()) {
      return NextResponse.json(
        { success: false, error: 'AI analysis is not configured' },
        { status: 503 }
      );
    }

    const body: AnalyzeRequest = await request.json();
    const { scanResult } = body;

    if (!scanResult) {
      return NextResponse.json(
        { success: false, error: 'Scan result is required' },
        { status: 400 }
      );
    }

    // Validate scanResult has required fields
    if (!scanResult.url || !scanResult.domain) {
      return NextResponse.json(
        { success: false, error: 'Invalid scan result' },
        { status: 400 }
      );
    }

    const analysis = await analyzeWithOllama(scanResult);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'AI analysis failed',
      },
      { status: 500 }
    );
  }
}
