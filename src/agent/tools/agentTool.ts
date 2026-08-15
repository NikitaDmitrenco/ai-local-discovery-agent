import { ToolInvocationTrace } from '../../domain/types';

export interface AgentTool<TParams, TResult> {
  name: string;
  description: string;
  execute(params: TParams): Promise<{ result: TResult; trace: ToolInvocationTrace }>;
}
