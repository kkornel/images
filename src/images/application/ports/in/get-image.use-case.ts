import type { GetImageQuery } from '@/images/application/queries/get-image.query';
import type { ImageResult } from '@/images/application/results/image.result';

export abstract class GetImageUseCase {
  abstract execute(query: GetImageQuery): Promise<ImageResult>;
}
