import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { ImageStorageException } from './image-storage.exception';
import storageConfig from 'src/config/storage.config';
import { ImageStorage, type StoreImageObjectInput } from './image.storage';

@Injectable()
export class S3ImageStorage implements ImageStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint?: string;
  private readonly forcePathStyle: boolean;

  constructor(
    @Inject(storageConfig.KEY)
    config: ConfigType<typeof storageConfig>,
  ) {
    this.bucket = config.bucket;
    this.region = config.region;
    this.endpoint = config.endpoint;
    this.forcePathStyle = config.forcePathStyle;

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      forcePathStyle: this.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(input: StoreImageObjectInput): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      });

      await this.client.send(command);
    } catch (error) {
      throw new ImageStorageException('upload', this.getErrorMessage(error));
    }
  }

  resolveUrl(key: string): string {
    if (this.endpoint) {
      const normalizedEndpoint = this.endpoint.replace(/\/+$/, '');

      if (this.forcePathStyle) {
        return `${normalizedEndpoint}/${this.bucket}/${key}`;
      }

      const endpointUrl = new URL(normalizedEndpoint);
      endpointUrl.hostname = `${this.bucket}.${endpointUrl.hostname}`;
      endpointUrl.pathname = `/${key}`;

      return endpointUrl.toString();
    }

    return `https://${this.bucket}.${this.region}.amazonaws.com/${key}`;
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      throw new ImageStorageException('delete', this.getErrorMessage(error));
    }
  }

  private getErrorMessage(error: unknown): string | undefined {
    if (error instanceof Error) {
      return error.message;
    }

    return undefined;
  }
}
