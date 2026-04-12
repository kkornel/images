import type { ListImagesQuery } from '@/images/application/queries/list-images.query';
import type { PaginatedResult } from '@/images/application/results/paginated-result';
import type { Image, NewImage } from '@/images/domain/image';

export abstract class ImageRepository {
  abstract create(image: NewImage): Promise<Image>;
  abstract findByUuid(uuid: string): Promise<Image | null>;
  abstract findAll(params: ListImagesQuery): Promise<PaginatedResult<Image>>;
}
