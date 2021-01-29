export class BaseSubmissionDto {
  id: string;

  state?: 'pending' | 'final';

  classify?: string;
}
