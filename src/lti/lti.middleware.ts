import { Injectable, Logger, LoggerService, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { LtiService } from './lti.service';

@Injectable()
export class LtiMiddleware implements NestMiddleware /*, OnModuleInit*/ {
  protected readonly logger: LoggerService;

  constructor(protected readonly ltiService: LtiService) {
    this.logger = new Logger(LtiMiddleware.name);
  }

  /*async onModuleInit(): Promise<void> {
    lti.setup(appConfig.key, {
      url: `mongodb://${appConfig.lti.database.host}:${appConfig.lti.database.port}/${appConfig.lti.database.database}?authSource=admin`,
      connection: {
        user: appConfig.lti.database.username ?? '',
        pass: appConfig.lti.database.password ?? '',
      }
    }, {
      cookies: {
        // Set secure to true if the testing platform is in a different domain and https is being used
        secure: appConfig.isProduction,
        // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
        sameSite: ''
      },
      devMode: appConfig.isDevelopment,
      tokenMaxAge: 60,
      cors: true
    });
    lti.onConnect(async (token, req: Request, res: Response) => {
      if (token) {
        const ltiParams = getLaunchParams(res);
        const data = {
          lti_id: token.user,
          ...token.userInfo,
        };
        let user = await this.userService.getUserByUsername(data.email);
        if ( user === null ) {
          user = await this.userService.createUser({
            firstName: data.given_name,
            lastName: data.family_name,
            username: data.email,
            email: data.email,
            emailVerified: true,
          });
        }
        const accessToken = (await this.userService.exchangeAdminTokenForUserToken(user.username)).access_token;
        this.logger.log('----------------- ' + req.res.locals.token);
        res.redirect(`${appConfig.lti.redirectUrl}?token=${req.res.locals.token}`)
          .cookie(appConfig.auth.keycloak.cookieKey, accessToken, { httpOnly: true, sameSite: 'none' })
          .redirect();
      } else res.redirect('/lti/error')
      //res.send('It\'s alive!')
    });

    await lti.deploy({ serverless: true, silent: false });

    const platform = await lti.registerPlatform({
      url: appConfig.lti.baseUrl,
      name: appConfig.lti.tool.name,
      clientId: appConfig.lti.tool.clientId,
      authenticationEndpoint: `${appConfig.lti.baseUrl}/mod/lti/auth.php`,
      accesstokenEndpoint: `${appConfig.lti.baseUrl}/mod/lti/token.php`,
      authConfig: { method: 'JWK_SET', key: `${appConfig.lti.baseUrl}/mod/lti/certs.php` }
    });

    const authConfig = await (platform as any).platformAuthConfig();
    console.log(authConfig);
    console.log(await (platform as any).platformPublicKey());
  }*/

  use(req: Request, res: Response, next: NextFunction): void {
    this.ltiService.route(req, res, next);
  }
}
