import { Injectable } from '@nestjs/common';

import { APPLICATION_ERROR_CODES } from '@/common/application-error-codes';
import { ApplicationException } from '@/common/application.exception';
import { toImageResult } from '@/images/application/image-result.mapper';
import { GetImageUseCase } from '@/images/application/ports/in/get-image.use-case';
import { ImageRepository } from '@/images/application/ports/out/image.repository';
import { ImageUrlResolver } from '@/images/application/ports/out/image-url.resolver';
import type { GetImageQuery } from '@/images/application/queries/get-image.query';
import type { ImageResult } from '@/images/application/results/image.result';

@Injectable()
export class GetImageService extends GetImageUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly imageUrlResolver: ImageUrlResolver,
  ) {
    super();
  }

  async execute(query: GetImageQuery): Promise<ImageResult> {
    const image = await this.imageRepository.findByUuid(query.uuid);

    if (!image) {
      throw new ApplicationException(
        APPLICATION_ERROR_CODES.IMAGE_NOT_FOUND,
        `Image with uuid ${query.uuid} was not found`,
      );
    }

    return toImageResult(image, this.imageUrlResolver);
  }
}
