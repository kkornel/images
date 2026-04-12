import type { ListImagesQuery } from '@/images/application/queries/list-images.query';
import type { ImageResult } from '@/images/application/results/image.result';
import type { PaginatedResult } from '@/images/application/results/paginated-result';

export abstract class ListImagesUseCase {
  abstract execute(
    query: ListImagesQuery,
  ): Promise<PaginatedResult<ImageResult>>;
}
