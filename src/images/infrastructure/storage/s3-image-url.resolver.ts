import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import { ImageUrlResolver } from '@/images/application/ports/out/image-url.resolver';
import storageConfig from '@/config/storage.config';

@Injectable()
export class S3ImageUrlResolver extends ImageUrlResolver {
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint?: string;
  private readonly forcePathStyle: boolean;

  constructor(
    @Inject(storageConfig.KEY)
    config: ConfigType<typeof storageConfig>,
  ) {
    super();

    this.bucket = config.bucket;
    this.region = config.region;
    this.endpoint = config.endpoint;
    this.forcePathStyle = config.forcePathStyle;
  }

  resolveUrl(key: string): string {
    if (this.endpoint) {
      const normalizedEndpoint = this.endpoint.replace(/\/+$/, '');

      if (this.forcePathStyle) {
        return normalizedEndpoint + '/' + this.bucket + '/' + key;
      }

      const endpointUrl = new URL(normalizedEndpoint);
      endpointUrl.hostname = this.bucket + '.' + endpointUrl.hostname;
      endpointUrl.pathname = '/' + key;

      return endpointUrl.toString();
    }

    return `https://${this.bucket}.${this.region}.amazonaws.com/${key}`;
  }
}
