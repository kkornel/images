import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImageOrmEntity } from '@/images/entities/image.entity';
import { ImagesController } from '@/images/images.controller';
import { ImagesService } from '@/images/images.service';
import { ImageProcessor } from '@/images/processor/image.processor';
import { SharpImageProcessor } from '@/images/processor/sharp-image.processor';
import { ImageRepository } from '@/images/repository/image.repository';
import { TypeOrmImageRepository } from '@/images/repository/typeorm-image.repository';
import { ImageStorage } from '@/images/storage/image.storage';
import { S3ImageStorage } from '@/images/storage/s3-image.storage';

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
