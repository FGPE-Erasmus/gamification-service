import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

/**
 * Check if the user performing the request is authenticated.
 */
@Injectable()
export class RestJwtGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext): Request {
    const request = context.switchToHttp().getRequest();
    return request;
  }
}
