import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { Request } from 'express';

import appConfig from '@/config/app.config';

const API_KEY_HEADER_NAME = 'x-api-key';

@Injectable()
export class ImagesApiKeyGuard implements CanActivate {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const providedApiKey = this.getApiKeyFromRequest(request);

    if (!providedApiKey) {
      throw new UnauthorizedException(`Missing ${API_KEY_HEADER_NAME} header.`);
    }

    const configuredApiKey = this.appConfiguration.imagesApiKey;

    if (providedApiKey !== configuredApiKey) {
      throw new UnauthorizedException('Invalid API key.');
    }

    return true;
  }

  private getApiKeyFromRequest(request: Request): string | undefined {
    const headerValue = request.headers[API_KEY_HEADER_NAME];

    if (typeof headerValue === 'string') {
      const trimmedValue = headerValue.trim();
      return trimmedValue === '' ? undefined : trimmedValue;
    }

    if (Array.isArray(headerValue)) {
      const firstValue = headerValue[0];

      if (typeof firstValue !== 'string') {
        return undefined;
      }

      const trimmedValue = firstValue.trim();
      return trimmedValue === '' ? undefined : trimmedValue;
    }

    return undefined;
  }
}
