import type { CreateImageCommand } from '@/images/application/commands/create-image.command';
import type { ImageResult } from '@/images/application/results/image.result';

export abstract class CreateImageUseCase {
  abstract execute(command: CreateImageCommand): Promise<ImageResult>;
}
