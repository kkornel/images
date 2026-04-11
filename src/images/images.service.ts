import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ImagesRepository } from './images.repository';
import type {
  CreateImageInput,
  Image,
  ListImagesParams,
  PaginatedResult,
} from './images.types';

@Injectable()
export class ImagesService {
  constructor(private readonly imagesRepository: ImagesRepository) {}

  create(input: CreateImageInput): Promise<Image> {
    return this.imagesRepository.save({
      uuid: randomUUID(),
      title: input.title,
      width: input.width,
      height: input.height,
      extension: 'png',
      size: 123,
      mimeType: 'image/png',
      storageKey: 'image.png',
    });
  }

  async findOne(uuid: string): Promise<Image> {
    const image = await this.imagesRepository.findById(uuid);

    if (!image) {
      throw new NotFoundException(`Image with uuid "${uuid}" was not found`);
    }

    return image;
  }

  findAll(
    params: Partial<ListImagesParams> = {},
  ): Promise<PaginatedResult<Image>> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 20);

    return this.imagesRepository.findAll({ page, limit });
  }
}
