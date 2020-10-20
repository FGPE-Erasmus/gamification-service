export class MooshakEvaluationDto {
  type: 'evaluation-summary';

  id: string;

  status: string;

  state: 'pending' | 'final';

  language: string;

  mark: number;

  metrics: Map<string, any>;

  feedback: string;

  observations: string;
}
