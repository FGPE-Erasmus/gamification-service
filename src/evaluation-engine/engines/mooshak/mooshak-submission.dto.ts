export class MooshakSubmissionDto {
  id: string;

  state?: 'pending' | 'final';

  classify?: string;
}
