import { Injectable } from '@nestjs/common';

import { toImageResult } from '@/images/application/image-result.mapper';
import { ListImagesUseCase } from '@/images/application/ports/in/list-images.use-case';
import { ImageRepository } from '@/images/application/ports/out/image.repository';
import { ImageUrlResolver } from '@/images/application/ports/out/image-url.resolver';
import type { ListImagesQuery } from '@/images/application/queries/list-images.query';
import type { ImageResult } from '@/images/application/results/image.result';
import type { PaginatedResult } from '@/images/application/results/paginated-result';

@Injectable()
export class ListImagesService extends ListImagesUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly imageUrlResolver: ImageUrlResolver,
  ) {
    super();
  }

  async execute(query: ListImagesQuery): Promise<PaginatedResult<ImageResult>> {
    const result = await this.imageRepository.findAll(query);

    return {
      items: result.items.map((image) =>
        toImageResult(image, this.imageUrlResolver),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
