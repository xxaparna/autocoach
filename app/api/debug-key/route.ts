import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check all possible API key environment variables
    const groqKey = process.env.GROQ_API_KEY;
    const googleKey = process.env.GOOGLE_API_KEY;
    const googleGenKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    const debugInfo: any = {
      environment: process.env.NODE_ENV,
      groq: {
        exists: !!groqKey,
        length: groqKey?.length || 0,
        startsWith: groqKey?.substring(0, 6) || 'missing',
        format: groqKey?.startsWith('gsk_') ? 'valid' : 'invalid'
      },
      google: {
        exists: !!googleKey,
        length: googleKey?.length || 0,
        startsWith: googleKey?.substring(0, 6) || 'missing',
        format: googleKey?.startsWith('AIza') ? 'valid' : 'invalid'
      },
      googleGen: {
        exists: !!googleGenKey,
        length: googleGenKey?.length || 0,
        startsWith: googleGenKey?.substring(0, 6) || 'missing',
        format: googleGenKey?.startsWith('AIza') ? 'valid' : 'invalid'
      }
    };

    // Test the Groq API key directly
    if (groqKey && groqKey.startsWith('gsk_')) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          }
        });

        const responseText = await response.text();
        
        if (response.ok) {
          const models = JSON.parse(responseText);
          debugInfo.groq.testResult = {
            status: 'success',
            modelsCount: models.data?.length || 0,
            availableModels: models.data?.slice(0, 3).map((m: any) => m.id) || []
          };
        } else {
          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch {
            errorData = { raw: responseText };
          }
          debugInfo.groq.testResult = {
            status: 'failed',
            httpStatus: response.status,
            httpStatusText: response.statusText,
            error: errorData
          };
        }
      } catch (testError: any) {
        debugInfo.groq.testResult = {
          status: 'error',
          message: testError.message
        };
      }
    }

    return NextResponse.json(debugInfo);

  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
