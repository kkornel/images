import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImageProcessor } from '@/images/application/ports/out/image.processor';
import { ImageRepository } from '@/images/application/ports/out/image.repository';
import { ImageStorage } from '@/images/application/ports/out/image.storage';
import { ImageUrlResolver } from '@/images/application/ports/out/image-url.resolver';
import { UniqueIdGenerator } from '@/images/application/ports/out/unique-id.generator';
import { NodeCryptoUniqueIdGenerator } from '@/images/infrastructure/identity/node-crypto-unique-id.generator';
import { SharpImageProcessor } from '@/images/infrastructure/processing/sharp-image.processor';
import { ImageOrmEntity } from '@/images/infrastructure/persistence/typeorm/image.orm-entity';
import { TypeOrmImageRepository } from '@/images/infrastructure/persistence/typeorm/typeorm-image.repository';
import { S3ImageStorage } from '@/images/infrastructure/storage/s3-image.storage';
import { S3ImageUrlResolver } from '@/images/infrastructure/storage/s3-image-url.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ImageOrmEntity])],
  providers: [
    {
      provide: ImageRepository,
      useClass: TypeOrmImageRepository,
    },
    {
      provide: ImageProcessor,
      useClass: SharpImageProcessor,
    },
    {
      provide: ImageStorage,
      useClass: S3ImageStorage,
    },
    {
      provide: ImageUrlResolver,
      useClass: S3ImageUrlResolver,
    },
    {
      provide: UniqueIdGenerator,
      useClass: NodeCryptoUniqueIdGenerator,
    },
  ],
  exports: [
    ImageRepository,
    ImageProcessor,
    ImageStorage,
    ImageUrlResolver,
    UniqueIdGenerator,
  ],
})
export class ImagesInfrastructureModule {}
