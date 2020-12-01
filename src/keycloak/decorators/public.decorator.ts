import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const PUBLIC = 'public';

export const Public = (...scopes: string[]): CustomDecorator => {
  return SetMetadata(PUBLIC, scopes);
};
