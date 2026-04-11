import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageOrmEntity } from '../entities/image.entity';
import { ImagesRepository } from './images.repository';
import type {
  CreateImageRecord,
  ListImagesParams,
  PaginatedResult,
  PersistedImage,
} from '../images.types';

@Injectable()
export class TypeOrmImagesRepository extends ImagesRepository {
  constructor(
    @InjectRepository(ImageOrmEntity)
    private readonly ormRepository: Repository<ImageOrmEntity>,
  ) {
    super();
  }

  async save(image: CreateImageRecord): Promise<PersistedImage> {
    const entity = this.ormRepository.create(image);
    const savedEntity = await this.ormRepository.save(entity);

    return this.toPersistedImage(savedEntity);
  }

  async findById(uuid: string): Promise<PersistedImage | null> {
    const entity = await this.ormRepository.findOne({
      where: { uuid },
    });

    return entity ? this.toPersistedImage(entity) : null;
  }

  async findAll(
    params: ListImagesParams,
  ): Promise<PaginatedResult<PersistedImage>> {
    const skip = (params.page - 1) * params.limit;

    const [entities, total] = await this.ormRepository.findAndCount({
      skip,
      take: params.limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      items: entities.map((entity) => this.toPersistedImage(entity)),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  private toPersistedImage(entity: ImageOrmEntity): PersistedImage {
    return {
      uuid: entity.uuid,
      title: entity.title,
      storageKey: entity.storageKey,
      mimeType: entity.mimeType,
      extension: entity.extension,
      width: entity.width,
      height: entity.height,
      size: entity.size,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
