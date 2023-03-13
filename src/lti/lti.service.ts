import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { IdToken, Provider as lti } from 'ltijs';
import { NextFunction, Request, Response, Router } from 'express';

import { appConfig } from '../app.config';
import { CreatePlatformArgs } from './dto/create-platform.args';
import { UserService } from '../keycloak/user.service';
import { LtiAuthDto } from './dto/auth.dto';
import { GameService } from '../game/game.service';
import { PlayerService } from '../player/player.service';
import { ChallengeStatusService } from '../challenge-status/challenge-status.service';
import { ActivityService } from '../evaluation-engine/activity.service';
import * as path from 'path';

@Injectable()
export class LtiService {
  protected readonly logger: LoggerService;

  constructor(
    protected readonly gameService: GameService,
    protected readonly userService: UserService,
    protected readonly playerService: PlayerService,
    protected readonly challengeStatusService: ChallengeStatusService,
    protected readonly activityService: ActivityService,
  ) {
    this.logger = new Logger(LtiService.name);

    this.logger.log(JSON.stringify(appConfig.basePath));
    this.logger.log(JSON.stringify(appConfig.lti));

    if ( appConfig.lti ) {
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
        const query = {};
        if (token.platformContext.custom?.game) {
          query['gameId'] = token.platformContext.custom.game;
        }
        if (token.platformContext.custom?.challenge) {
          query['challengeId'] = token.platformContext.custom.challenge;
        }
        if (token.platformContext.custom?.exercise) {
          query['exerciseId'] = token.platformContext.custom.exercise;
        }
        this.logger.log(JSON.stringify(query));
        this.logger.log(JSON.stringify(appConfig.lti));
        return lti.redirect(res, appConfig.lti.redirectUrl, { query });
      });

      const router = Router();
      router.all(/.*/, (req, res, next) => {
        next();
      });
      lti.app.use(router);
      lti.deploy({ serverless: true });
    }
  }

  async auth(token: IdToken, body: LtiAuthDto): Promise<any> {
    const role = token.platformContext.roles.filter(r => r.endsWith('#Learner')).length > 0 ? 'student' : 'teacher';

    const data = {
      lti_id: token.user,
      ...token.userInfo,
    };

    // get or create user
    let user = await this.userService.getUserByUsername(data.email, true);
    if (user === null) {
      user = await this.userService.createUser(
        {
          firstName: data.given_name,
          lastName: data.family_name,
          username: data.email,
          email: data.email,
          emailVerified: true,
        },
        role,
      );
    }

    // enroll in game
    if (body.game) {
      if (role === 'teacher') {
        await this.gameService.assignInstructor(body.game, user.id);
      } else {
        await this.playerService.enroll(body.game, user.id, true);
      }
    }

    return {
      ...(await this.userService.exchangeAdminTokenForUserToken(user.id)),
      role,
    };
  }

  async registerPlatform(data: CreatePlatformArgs): Promise<any> {
    const baseUrl = data.url;
    const platform = await lti.registerPlatform({
      url: baseUrl,
      name: data.name,
      clientId: data.clientId,
      authenticationEndpoint: `${baseUrl}/mod/lti/auth.php`,
      accesstokenEndpoint: `${baseUrl}/mod/lti/token.php`,
      authConfig: { method: 'JWK_SET', key: `${baseUrl}/mod/lti/certs.php` },
    });
    const publicKey = await (platform as any).platformPublicKey();
    return {
      publicKey,
    };
  }

  route(req: Request, res: Response, next: NextFunction): void {
    req.baseUrl = path.join(appConfig.basePath, req.baseUrl);
    lti.app(req, res, next);
  }

  async sendLastGrade(idtoken: IdToken, gameId: string, challengeId: string, activityId?: string): Promise<void> {
    const user = await this.userService.getUserByUsername(idtoken.userInfo.email);
    const player = await this.playerService.findByGameAndUser(gameId, user.id);
    if (activityId) {
      const activityStatus = await this.activityService.getActivityStatus(gameId, activityId, player.id);
      return await this.grade(
        idtoken,
        activityStatus.solved ? 100 : 0,
        activityStatus.solved ? 'Completed' : undefined,
      );
    } else {
      const progress = (await this.challengeStatusService.progress(challengeId, player.id)) * 100;
      this.logger.log(progress);
      return await this.grade(idtoken, progress, progress >= 100 ? 'Completed' : undefined);
    }
  }

  async grade(idtoken: IdToken, score: number, label: string): Promise<any> {
    this.logger.log(score);
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
      this.logger.log(lineItemId);
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
      return await lti.Grade.submitScore(idtoken, lineItemId, gradeObj);
    } catch (err) {
      console.log(err.message);
      return err;
    }
  }
}
