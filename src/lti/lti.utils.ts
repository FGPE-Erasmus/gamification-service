import { Response } from 'express';
import { IdToken } from 'ltijs';

export function getToken(res: Response): IdToken | undefined {
  return (res as any).locals?.token;
}

export interface LTILaunchParams {
  user: string;
  context: {
    id: string;
    title: string;
    type: string[];
  };
  custom: {
    courseid: string;
    sectionnames: string[];
    sectionsisids: string;
    userid: string;
    federatednetid: string;
    namesortable: string;
    namedisplay: string;
    userpronouns: string;
    lmsroles: string[];
  };
}

export function getLaunchParams(res: Response): LTILaunchParams {
  return (res as any).locals?.context;
}
