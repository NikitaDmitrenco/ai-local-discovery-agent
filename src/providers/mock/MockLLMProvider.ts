import { LLMProvider, LLMOptions } from '../types';

export class MockLLMProvider implements LLMProvider {
  name = 'MockLLMEngine';

  async generateText(prompt: string, options?: LLMOptions): Promise<string> {
    if (prompt.includes('refinement') || prompt.includes('refine')) {
      return 'Prioritizing matching venues based on selected atmosphere and distance.';
    }
    return 'Detailed AI intent analysis for local discovery.';
  }

  async generateStructured<T>(
    prompt: string,
    schemaDescription: string,
    options?: LLMOptions
  ): Promise<T> {
    // In Mock mode without external cloud LLM, throw so IntentParser applies the high-accuracy rule-based semantic parser
    throw new Error('MockLLMEngine offline structured mode -> routing to semantic taxonomy engine');
  }
}
