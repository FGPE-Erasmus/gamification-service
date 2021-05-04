import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const SCOPES = 'scopes';

export const Scopes = (...scopes: string[]): CustomDecorator => SetMetadata(SCOPES, scopes);
