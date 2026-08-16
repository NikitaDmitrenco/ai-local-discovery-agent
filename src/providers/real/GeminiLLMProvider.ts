import { LLMProvider, LLMOptions } from '../types';

export class GeminiLLMProvider implements LLMProvider {
  name = 'GoogleGeminiProvider';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateText(prompt: string, options?: LLMOptions): Promise<string> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options?.temperature ?? 0.2,
            maxOutputTokens: options?.maxTokens ?? 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.warn('Gemini generateText error, falling back:', error);
      throw error;
    }
  }

  async generateStructured<T>(
    prompt: string,
    schemaDescription: string,
    options?: LLMOptions
  ): Promise<T> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: {
            parts: [
              {
                text: `You are an expert Aura intent extraction parser. Respond ONLY with a valid JSON object matching this schema description: ${schemaDescription}. Do not include markdown fences or any other commentary.`,
              },
            ],
          },
          generationConfig: {
            temperature: options?.temperature ?? 0.1,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini structured API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      return JSON.parse(text) as T;
    } catch (error) {
      console.warn('Gemini structured error, falling back:', error);
      throw error;
    }
  }
}
