import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import {
  ImageStorage,
  type StoreImageInput,
} from '@/images/application/ports/out/image.storage';
import storageConfig from '@/config/storage.config';

import { ImageStorageException } from './image-storage.exception';

@Injectable()
export class S3ImageStorage extends ImageStorage {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(
    @Inject(storageConfig.KEY)
    config: ConfigType<typeof storageConfig>,
  ) {
    super();

    this.bucket = config.bucket;

    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(input: StoreImageInput): Promise<void> {
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
