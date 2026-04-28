import type { Image } from '@/images/domain/image';
import { ImageOrmEntity } from '@/images/infrastructure/persistence/typeorm/image.orm-entity';

export class ImageMapper {
  static toDomain(image: ImageOrmEntity): Image {
    return {
      uuid: image.uuid,
      title: image.title,
      storageKey: image.storageKey,
      mimeType: image.mimeType,
      extension: image.extension,
      width: image.width,
      height: image.height,
      size: image.size,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }

  static toPersistence(image: Image): ImageOrmEntity {
    const entity = new ImageOrmEntity();
    entity.uuid = image.uuid;
    entity.title = image.title;
    entity.storageKey = image.storageKey;
    entity.mimeType = image.mimeType;
    entity.extension = image.extension;
    entity.width = image.width;
    entity.height = image.height;
    entity.size = image.size;
    entity.createdAt = image.createdAt;
    entity.updatedAt = image.updatedAt;
    return entity;
  }
}
