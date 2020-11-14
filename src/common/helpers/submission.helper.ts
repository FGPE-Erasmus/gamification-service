import { Submission } from '../../submission/models/submission.model';
import { Result } from '../../submission/models/result.enum';

export function bestSubmission(submissions: Submission[]): Submission {
  if (submissions.length === 0) {
    return undefined;
  }

  const sorted = submissions.sort((a: Submission, b: Submission) => {
    if (a.result === b.result) {
      if (a.grade === b.grade) {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      return b.grade - a.grade;
    }
    if (a.result === Result.ACCEPT) {
      return -1;
    }
    if (b.result === Result.ACCEPT) {
      return 1;
    }
    if (a.result === Result.WRONG_ANSWER) {
      return -1;
    }
    if (b.result === Result.WRONG_ANSWER) {
      return 1;
    }
    return a.grade === b.grade
      ? new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      : b.grade - a.grade;
  });

  return sorted[0];
}
