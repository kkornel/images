import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageOrmEntity } from './entities/image.entity';
import type {
  CreateImageRecord,
  Image,
  ListImagesParams,
  PaginatedResult,
} from './images.types';

@Injectable()
export class ImagesRepository {
  constructor(
    @InjectRepository(ImageOrmEntity)
    private readonly ormRepository: Repository<ImageOrmEntity>,
  ) {}

  async save(image: CreateImageRecord): Promise<Image> {
    const entity = this.ormRepository.create(image);
    const savedEntity = await this.ormRepository.save(entity);

    return this.toImage(savedEntity);
  }

  async findById(uuid: string): Promise<Image | null> {
    const entity = await this.ormRepository.findOne({
      where: { uuid },
    });

    return entity ? this.toImage(entity) : null;
  }

  async findAll(params: ListImagesParams): Promise<PaginatedResult<Image>> {
    const skip = (params.page - 1) * params.limit;

    const [entities, total] = await this.ormRepository.findAndCount({
      skip,
      take: params.limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      items: entities.map((entity) => this.toImage(entity)),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  private toImage(entity: ImageOrmEntity): Image {
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
