export class MooshakValidationDto {
  type: 'evaluation-summary';

  id: string;

  state: 'pending' | 'final';

  evaluatedAt: number;

  language: string;

  status: string;

  metrics: Map<string, number>;

  outputs: { [k: string]: string };

  userExecutionTimes: { [k: string]: string };

  feedback: string;

  observations: string;
}
