import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImageOrmEntity } from './entities/image.entity';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ImageProcessor } from './processor/image.processor';
import { SharpImageProcessor } from './processor/sharp-image.processor';
import { ImageRepository } from './repository/image.repository';
import { TypeOrmImageRepository } from './repository/typeorm-image.repository';
import { ImageStorage } from './storage/image.storage';
import { S3ImageStorage } from './storage/s3-image.storage';

@Module({
  imports: [TypeOrmModule.forFeature([ImageOrmEntity])],
  controllers: [ImagesController],
  providers: [
    ImagesService,
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
  ],
})
export class ImagesModule {}
