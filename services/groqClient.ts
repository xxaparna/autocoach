import { Groq } from 'groq-sdk';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type GenerateTextOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  system?: string;
  messages?: Message[];
  prompt?: string;
};

export class GroqClient {
  private client: Groq;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel: string = 'llama-3.3-70b-versatile') {
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set');
    }
    this.client = new Groq({ apiKey });
    this.defaultModel = defaultModel;
  }

  async generateText({
    model = this.defaultModel,
    temperature = 0.3,
    maxTokens = 2048,
    system = '',
    messages = [],
    prompt = '',
  }: GenerateTextOptions = {}) {
    try {
      const chatMessages: Message[] = [];
      
      if (system) {
        chatMessages.push({ role: 'system', content: system });
      }
      
      if (prompt) {
        chatMessages.push({ role: 'user', content: prompt });
      } else if (messages.length > 0) {
        chatMessages.push(...messages);
      } else {
        throw new Error('Either prompt or messages must be provided');
      }

      console.log('Groq API Request:', {
        model,
        messageCount: chatMessages.length,
        temperature,
        maxTokens
      });

      const response = await this.client.chat.completions.create({
        model,
        messages: chatMessages as any, // Type assertion needed due to slight type differences
        temperature,
        max_tokens: maxTokens,
      });

      console.log('Groq API Response:', {
        model: response.model,
        usage: response.usage,
        hasContent: !!response.choices[0]?.message?.content
      });

      return {
        text: response.choices[0]?.message?.content || '',
        usage: response.usage,
      };
    } catch (error: any) {
      console.error('Groq API error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
        stack: error.stack
      });
      
      // Handle specific API key errors
      if (error.status === 401) {
        throw new Error('Groq API key is invalid or expired. Please check your GROQ_API_KEY environment variable.');
      } else if (error.status === 429) {
        throw new Error('Groq API rate limit exceeded. Please try again later.');
      } else if (error.status === 403) {
        throw new Error('Groq API access forbidden. Check your API key permissions.');
      }
      
      throw new Error(`Groq API error: ${error.message}`);
    }
  }

  async streamText(options: GenerateTextOptions) {
    const { model = this.defaultModel, temperature = 0.3, maxTokens = 2048, messages = [] } = options;
    
    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages: messages as any,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });

      return { stream };
    } catch (error: any) {
      console.error('Groq streaming error:', error);
      throw new Error(`Groq streaming error: ${error.message}`);
    }
  }
}

// Lazy initialization to handle serverless environments
let _groqClient: GroqClient | null = null;

export const groqClient = {
  getInstance: () => {
    if (!_groqClient) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('GROQ_API_KEY is not set in environment variables');
      }
      _groqClient = new GroqClient(apiKey);
    }
    return _groqClient;
  },
  generateText: (options: GenerateTextOptions) => groqClient.getInstance().generateText(options),
  streamText: (options: GenerateTextOptions) => groqClient.getInstance().streamText(options)
};
