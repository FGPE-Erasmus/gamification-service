import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const RESOURCE = 'resource';

export const Resource = (resource: string): CustomDecorator => SetMetadata(RESOURCE, resource);
