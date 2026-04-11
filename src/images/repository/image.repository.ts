import type {
  CreateImageRecord,
  ListImagesParams,
  PaginatedResult,
  PersistedImage,
} from '../image.types';

export abstract class ImageRepository {
  abstract create(image: CreateImageRecord): Promise<PersistedImage>;
  abstract findByUuid(uuid: string): Promise<PersistedImage | null>;
  abstract findAll(
    params: ListImagesParams,
  ): Promise<PaginatedResult<PersistedImage>>;
}
