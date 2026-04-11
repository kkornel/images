import type { ListImagesParams } from '@/images/types/list-images.params';
import type { PaginatedResult } from '@/images/types/paginated-result.type';

import type {
  CreateImageRecord,
  ListImagesParams,
  PaginatedResult,
  PersistedImage,
} from './image.repository.types';

export abstract class ImageRepository {
  abstract create(image: CreateImageRecord): Promise<PersistedImage>;
  abstract findByUuid(uuid: string): Promise<PersistedImage | null>;
  abstract findAll(
    params: ListImagesParams,
  ): Promise<PaginatedResult<PersistedImage>>;
}
