import { Injectable } from '@nestjs/common';

import { APPLICATION_ERROR_CODES } from '@/common/application-error-codes';
import { ApplicationException } from '@/common/application.exception';
import { DeleteImageUseCase } from '@/images/application/ports/in/delete-image.use-case';
import { ImageRepository } from '@/images/application/ports/out/image.repository';
import { ImageStorage } from '@/images/application/ports/out/image.storage';
import type { DeleteImageCommand } from '@/images/application/commands/delete-image.command';

@Injectable()
export class DeleteImageService extends DeleteImageUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly imageStorage: ImageStorage,
  ) {
    super();
  }

  async execute(command: DeleteImageCommand): Promise<void> {
    const image = await this.imageRepository.findByUuid(command.uuid);

    if (!image) {
      throw new ApplicationException(
        APPLICATION_ERROR_CODES.IMAGE_NOT_FOUND,
        `Image with uuid ${command.uuid} was not found`,
      );
    }

    await this.imageRepository.deleteByUuid(command.uuid);

    try {
      await this.imageStorage.delete(image.storageKey);
    } catch {
      // Could store error in DB
    }
  }
}
