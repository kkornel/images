import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import type { CreateImageCommand } from '@/images/application/commands/create-image.command';
import { toImageResult } from '@/images/application/image-result.mapper';
import { CreateImageUseCase } from '@/images/application/ports/in/create-image.use-case';
import { ImageProcessor } from '@/images/application/ports/out/image.processor';
import { ImageRepository } from '@/images/application/ports/out/image.repository';
import { ImageStorage } from '@/images/application/ports/out/image.storage';
import { ImageUrlResolver } from '@/images/application/ports/out/image-url.resolver';
import type { ImageResult } from '@/images/application/results/image.result';

@Injectable()
export class CreateImageService extends CreateImageUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly imageProcessor: ImageProcessor,
    private readonly imageStorage: ImageStorage,
    private readonly imageUrlResolver: ImageUrlResolver,
  ) {
    super();
  }

  async execute(command: CreateImageCommand): Promise<ImageResult> {
    const processedImage = await this.imageProcessor.process({
      fileBuffer: command.fileBuffer,
      targetWidth: command.width,
      targetHeight: command.height,
    });

    const imageUuid = randomUUID();
    const storageKey = `${imageUuid}.${processedImage.extension}`;

    await this.imageStorage.upload({
      key: storageKey,
      body: processedImage.buffer,
      contentType: processedImage.mimeType,
    });

    try {
      const image = await this.imageRepository.create({
        uuid: imageUuid,
        title: command.title,
        storageKey,
        mimeType: processedImage.mimeType,
        extension: processedImage.extension,
        width: processedImage.width,
        height: processedImage.height,
        size: processedImage.size,
      });

      return toImageResult(image, this.imageUrlResolver);
    } catch (error) {
      await this.tryRollbackUpload(storageKey);
      throw error;
    }
  }

  private async tryRollbackUpload(storageKey: string): Promise<void> {
    try {
      await this.imageStorage.delete(storageKey);
    } catch {
      // Best-effort cleanup only. The original error remains the primary root cause
    }
  }
}
