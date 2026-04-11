import { randomUUID } from 'node:crypto';

import { Injectable, NotFoundException } from '@nestjs/common';

import { ImageProcessor } from './processor/image.processor';
import { ImageRepository } from './repository/image.repository';
import { ImageStorage } from './storage/image.storage';
import type { PersistedImage } from './repository/image.repository.types';
import type { CreateImageInput } from './types/create-image.input';
import type { Image } from './types/image.model';
import type { ListImagesParams } from './types/list-images.params';
import type { PaginatedResult } from './types/paginated-result.type';

@Injectable()
export class ImagesService {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly imageProcessor: ImageProcessor,
    private readonly imageStorage: ImageStorage,
  ) {}

  async create(input: CreateImageInput): Promise<Image> {
    const processedImage = await this.imageProcessor.process({
      fileBuffer: input.fileBuffer,
      targetWidth: input.width,
      targetHeight: input.height,
    });

    const imageUuid = randomUUID();
    const storageKey = `${imageUuid}.${processedImage.extension}`;

    await this.imageStorage.upload({
      key: storageKey,
      body: processedImage.buffer,
      contentType: processedImage.mimeType,
    });

    try {
      const persistedImage = await this.imageRepository.create({
        uuid: imageUuid,
        title: input.title,
        storageKey,
        mimeType: processedImage.mimeType,
        extension: processedImage.extension,
        width: processedImage.width,
        height: processedImage.height,
        size: processedImage.size,
      });

      return this.toImage(persistedImage);
    } catch (error) {
      await this.tryRollbackUpload(storageKey);
      throw error;
    }
  }

  async findOne(uuid: string): Promise<Image> {
    const persistedImage = await this.imageRepository.findByUuid(uuid);

    if (!persistedImage) {
      throw new NotFoundException(`Image with uuid "${uuid}" was not found`);
    }

    return this.toImage(persistedImage);
  }

  async findAll(params: ListImagesParams): Promise<PaginatedResult<Image>> {
    const result = await this.imageRepository.findAll(params);

    return {
      items: result.items.map((image) => this.toImage(image)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  private toImage(image: PersistedImage): Image {
    return {
      uuid: image.uuid,
      title: image.title,
      url: this.imageStorage.resolveUrl(image.storageKey),
      mimeType: image.mimeType,
      extension: image.extension,
      width: image.width,
      height: image.height,
      size: image.size,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }

  private async tryRollbackUpload(storageKey: string): Promise<void> {
    try {
      await this.imageStorage.delete(storageKey);
    } catch {
      // Best-effort cleanup only. The original error remains the primary root cause
    }
  }
}
