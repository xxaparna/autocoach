import { NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"

export async function GET() {
  try {
    // Check for Google API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Google API key not found in environment',
        status: 'missing_key',
        checkedVars: ['GOOGLE_GENERATIVE_AI_API_KEY', 'GOOGLE_API_KEY']
      }, { status: 500 });
    }

    // Test API key format
    if (!apiKey.startsWith('AIza')) {
      return NextResponse.json({ 
        error: 'Invalid Google API key format. Should start with "AIza"',
        status: 'invalid_format',
        keyPrefix: apiKey.substring(0, 10) + '...',
        keyLength: apiKey.length
      }, { status: 400 });
    }

    console.log('Testing Google API with key prefix:', apiKey.substring(0, 10) + '...');

    // Test simple API call
    const google = createGoogleGenerativeAI({ apiKey });
    
    try {
      const response = await generateText({
        model: google("gemini-2.5-flash"),
        temperature: 0.1,
        prompt: "Respond with just the word 'SUCCESS'",
      });

      return NextResponse.json({ 
        status: 'success',
        message: 'Google API key is valid',
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 10) + '...',
        model: 'gemini-2.5-flash',
        response: response.text.trim(),
        usage: response.usage
      });

    } catch (apiError: any) {
      console.error('Google API test error:', apiError);
      
      return NextResponse.json({ 
        error: 'Google API test failed',
        status: 'api_error',
        details: {
          message: apiError.message,
          status: apiError.status,
          code: apiError.code,
          type: apiError.type
        },
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 10) + '...'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Google API test error:', error);
    return NextResponse.json({ 
      error: 'Failed to test Google API key',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKeyPresent: !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY),
      checkedVars: ['GOOGLE_GENERATIVE_AI_API_KEY', 'GOOGLE_API_KEY']
    }, { status: 500 });
  }
}
