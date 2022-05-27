import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { IdToken, Provider as lti } from 'ltijs';
import { NextFunction, Request, Response, Router } from 'express';

import { appConfig } from '../app.config';

@Injectable()
export class LtiService {
  protected readonly logger: LoggerService;

  constructor() {
    this.logger = new Logger(LtiService.name);

    lti.setup(
      appConfig.key,
      {
        url: `mongodb://${appConfig.lti.database.host}:${appConfig.lti.database.port}/${appConfig.lti.database.database}?authSource=admin`,
        connection: {
          user: appConfig.lti.database.username ?? '',
          pass: appConfig.lti.database.password ?? '',
        },
      },
      {
        cookies: {
          // Set secure to true if the testing platform is in a different domain and https is being used
          secure: appConfig.isProduction,
          // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
          sameSite: '',
        },
        devMode: appConfig.isDevelopment,
        tokenMaxAge: 60,
        cors: true,
      },
    );

    lti.onConnect(async (token: IdToken, req: Request, res: Response) => {
      const query = {
        username: token.userInfo.name,
        contextId: token.platformContext.context.id,
        contextLabel: token.platformContext.context.label,
        contextTitle: token.platformContext.context.title,
      };
      if (token.platformContext.custom?.game) {
        query['gameId'] = token.platformContext.custom.game;
      }
      if (token.platformContext.custom?.challenge) {
        query['challengeId'] = token.platformContext.custom.challenge;
      }
      if (token.platformContext.custom?.exercise) {
        query['exerciseId'] = token.platformContext.custom.exercise;
      }
      return lti.redirect(res, appConfig.lti.redirectUrl, { query });
    });

    const router = Router();
    router.all(/.*/, (req, res, next) => {
      next();
    });
    lti.app.use(router);
    lti.deploy({ serverless: true });
  }

  async login(token: any, body: any): Promise<any> {
    //const role = token.platformContext.roles;
    this.logger.log(JSON.stringify(token));
    this.logger.log(JSON.stringify(body));
  }

  async registerPlatform(data: any): Promise<void> {
    const baseUrl = data.url;
    await lti.registerPlatform({
      url: baseUrl,
      name: data.name,
      clientId: data.clientId,
      authenticationEndpoint: `${baseUrl}/mod/lti/auth.php`,
      accesstokenEndpoint: `${baseUrl}/mod/lti/token.php`,
      authConfig: { method: 'JWK_SET', key: `${baseUrl}/mod/lti/certs.php` },
    });
  }

  route(req: Request, res: Response, next: NextFunction): void {
    lti.app(req, res, next);
  }

  async grade(idtoken: IdToken, score: number, label: string): Promise<void> {
    try {
      // Creating Grade object
      const gradeObj = {
        userId: idtoken.user,
        scoreGiven: score,
        scoreMaximum: 100,
        activityProgress: 'Completed',
        gradingProgress: 'FullyGraded',
      };

      // Attempting to retrieve it from idtoken
      let lineItemId = idtoken.platformContext.endpoint.lineitem;
      if (!lineItemId) {
        const response = await lti.Grade.getLineItems(idtoken, { resourceLinkId: true });
        const lineItems = response.lineItems;
        const lineItemForLabel = lineItems.find(v => v.label === label);
        if (!lineItemForLabel) {
          // Creating line item if there is none
          const newLineItem = {
            scoreMaximum: 100,
            label,
            tag: 'tag-grade',
            resourceLinkId: idtoken.platformContext.resource.id,
          };
          const lineItem = await lti.Grade.createLineItem(idtoken, newLineItem);
          lineItemId = lineItem.id;
        } else lineItemId = lineItemForLabel.id;
      }

      // Sending Grade
      const responseGrade = await lti.Grade.submitScore(idtoken, lineItemId, gradeObj);
      return responseGrade;
    } catch (err) {
      console.log(err.message);
      return err;
    }
  }
}
