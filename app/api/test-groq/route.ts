import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'GROQ_API_KEY not found in environment',
        status: 'missing_key'
      }, { status: 500 });
    }

    // Test API key format
    if (!apiKey.startsWith('gsk_')) {
      return NextResponse.json({ 
        error: 'Invalid API key format. Should start with "gsk_"',
        status: 'invalid_format',
        keyPrefix: apiKey.substring(0, 8) + '...'
      }, { status: 400 });
    }

    // Test simple API call
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      
      return NextResponse.json({ 
        error: 'API key validation failed',
        status: response.status,
        statusText: response.statusText,
        details: errorData,
        apiKeyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 8) + '...'
      }, { status: response.status });
    }

    const models = JSON.parse(responseText);
    
    // Check if our desired model is available
    const targetModel = 'llama-3.3-70b-versatile';
    const modelAvailable = models.data?.some((model: any) => model.id === targetModel);

    return NextResponse.json({ 
      status: 'success',
      message: 'API key is valid',
      apiKeyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 8) + '...',
      modelsCount: models.data?.length || 0,
      targetModelAvailable: modelAvailable,
      availableModels: models.data?.slice(0, 5).map((m: any) => m.id) || []
    });

  } catch (error) {
    console.error('Groq API test error:', error);
    return NextResponse.json({ 
      error: 'Failed to test API key',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKeyPresent: !!process.env.GROQ_API_KEY,
      apiKeyLength: process.env.GROQ_API_KEY?.length || 0
    }, { status: 500 });
  }
}
