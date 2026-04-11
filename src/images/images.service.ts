import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ImagesRepository } from './images.repository';
import type {
  CreateImageInput,
  Image,
  ListImagesParams,
  PaginatedResult,
  PersistedImage,
} from './images.types';
import { ImageProcessor } from './processor/image.processor';
import { ImageStorage } from './storage/image.storage';

@Injectable()
export class ImagesService {
  constructor(
    private readonly imagesRepository: ImagesRepository,
    private readonly imageProcessor: ImageProcessor,
    private readonly imageStorage: ImageStorage,
  ) {}

  async create(input: CreateImageInput): Promise<Image> {
    const processedImage = await this.imageProcessor.process({
      fileBuffer: input.file,
      targetWidth: input.width,
      targetHeight: input.height,
    });

    const imageId = randomUUID();
    const storageKey = `${imageId}.${processedImage.extension}`;

    await this.imageStorage.upload({
      key: storageKey,
      body: processedImage.buffer,
      contentType: processedImage.mimeType,
    });

    try {
      const savedImage = await this.imagesRepository.save({
        uuid: imageId,
        title: input.title,
        storageKey,
        mimeType: processedImage.mimeType,
        extension: processedImage.extension,
        width: processedImage.width,
        height: processedImage.height,
        size: processedImage.size,
      });

      return this.toPublicImage(savedImage);
    } catch (error) {
      await this.tryRollbackUpload(storageKey);
      throw error;
    }
  }

  async findOne(uuid: string): Promise<Image> {
    const image = await this.imagesRepository.findById(uuid);

    if (!image) {
      throw new NotFoundException(`Image with uuid "${uuid}" was not found`);
    }

    return this.toPublicImage(image);
  }

  async findAll(
    params: Partial<ListImagesParams> = {},
  ): Promise<PaginatedResult<Image>> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 20);

    const result = await this.imagesRepository.findAll({ page, limit });

    return {
      items: result.items.map((image) => this.toPublicImage(image)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  private toPublicImage(image: PersistedImage): Image {
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
