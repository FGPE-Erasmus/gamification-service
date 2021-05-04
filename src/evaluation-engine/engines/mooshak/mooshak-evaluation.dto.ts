export class MooshakEvaluationDto {
  type: 'evaluation-summary';

  id: string;

  state: 'pending' | 'final';

  evaluatedAt: number;

  language: string;

  status: string;

  mark: number;

  metrics: Map<string, number>;

  feedback: string;

  observations: string;
}
