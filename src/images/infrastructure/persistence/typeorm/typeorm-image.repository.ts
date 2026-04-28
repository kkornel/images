import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { ImageRepository } from '@/images/application/ports/out/image.repository';
import type { ListImagesQuery } from '@/images/application/queries/list-images.query';
import type { PaginatedResult } from '@/images/application/results/paginated-result';
import type { Image, NewImage } from '@/images/domain/image';
import { ImageOrmEntity } from '@/images/infrastructure/persistence/typeorm/image.orm-entity';
import { ImageMapper } from '@/images/infrastructure/persistence/mappers/image.mapper';

@Injectable()
export class TypeOrmImageRepository extends ImageRepository {
  constructor(
    @InjectRepository(ImageOrmEntity)
    private readonly ormRepository: Repository<ImageOrmEntity>,
  ) {
    super();
  }

  async create(image: NewImage): Promise<Image> {
    const entity = this.ormRepository.create(image);
    const savedEntity = await this.ormRepository.save(entity);

    return ImageMapper.toDomain(savedEntity);
  }

  async findByUuid(uuid: string): Promise<Image | null> {
    const entity = await this.ormRepository.findOne({
      where: { uuid },
    });

    return entity ? ImageMapper.toDomain(entity) : null;
  }

  async findAll(params: ListImagesQuery): Promise<PaginatedResult<Image>> {
    const skip = (params.page - 1) * params.limit;

    const [entities, total] = await this.ormRepository.findAndCount({
      skip,
      take: params.limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      items: entities.map((entity) => ImageMapper.toDomain(entity)),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async deleteByUuid(uuid: string): Promise<void> {
    await this.ormRepository.delete({
      uuid,
    });
  }
}
