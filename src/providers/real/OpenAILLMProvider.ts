import { LLMProvider, LLMOptions } from '../types';

export class OpenAILLMProvider implements LLMProvider {
  name = 'OpenAICompatibleProvider';
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(
    apiKey: string,
    baseURL = 'https://api.openai.com/v1',
    model = 'gpt-4o-mini'
  ) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.model = model;
  }

  async generateText(prompt: string, options?: LLMOptions): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: options?.systemPrompt || 'You are an AI local discovery assistant.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens ?? 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.warn('OpenAI generateText error, falling back:', error);
      throw error;
    }
  }

  async generateStructured<T>(
    prompt: string,
    schemaDescription: string,
    options?: LLMOptions
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are an expert AI Local Discovery intent extraction engine. Respond strictly with a JSON object matching this description: ${schemaDescription}. No surrounding markdown.`,
            },
            { role: 'user', content: prompt },
          ],
          temperature: options?.temperature ?? 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI structured error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content) as T;
    } catch (error) {
      console.warn('OpenAI structured error, falling back:', error);
      throw error;
    }
  }
}
