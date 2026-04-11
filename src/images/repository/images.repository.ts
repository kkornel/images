import type {
  CreateImageRecord,
  ListImagesParams,
  PaginatedResult,
  PersistedImage,
} from '../images.types';

export abstract class ImagesRepository {
  abstract save(image: CreateImageRecord): Promise<PersistedImage>;
  abstract findById(uuid: string): Promise<PersistedImage | null>;
  abstract findAll(
    params: ListImagesParams,
  ): Promise<PaginatedResult<PersistedImage>>;
}
