import { randomUUID } from 'node:crypto';

import { Injectable, NotFoundException } from '@nestjs/common';

import { ImageProcessor } from './processor/image.processor';
import { ImageRepository } from './repository/image.repository';
import { ImageStorage } from './storage/image.storage';
import type {
  CreateImageInput,
  Image,
  ListImagesParams,
  PaginatedResult,
  PersistedImage,
} from './image.types';

const DEFAULT_IMAGES_PAGE = 1;
const MIN_IMAGES_LIMIT = 1;
const DEFAULT_IMAGES_LIMIT = 20;
const MAX_IMAGES_LIMIT = 100;

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

  async findAll(
    params: Partial<ListImagesParams> = {},
  ): Promise<PaginatedResult<Image>> {
    const normalizedParams = this.normalizeListImagesParams(params);
    const result = await this.imageRepository.findAll(normalizedParams);

    return {
      items: result.items.map((image) => this.toImage(image)),
      total: result.total,
      page: normalizedParams.page,
      limit: normalizedParams.limit,
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

  private normalizeListImagesParams(
    params: Partial<ListImagesParams>,
  ): ListImagesParams {
    return {
      page: Math.max(DEFAULT_IMAGES_PAGE, params.page ?? DEFAULT_IMAGES_PAGE),
      limit: Math.min(
        MAX_IMAGES_LIMIT,
        Math.max(MIN_IMAGES_LIMIT, params.limit ?? DEFAULT_IMAGES_LIMIT),
      ),
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
