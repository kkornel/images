import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { ImagesRepository } from './images.repository';
import { ImageOrmEntity } from './entities/image.entity';
import { ImagesProcessor } from './processor/images.processor';
import { ImageStorage } from './storage/image.storage';
import { S3ImageStorage } from './storage/s3-image.storage';

@Module({
  imports: [TypeOrmModule.forFeature([ImageOrmEntity])],
  providers: [
    ImagesService,
    ImagesRepository,
    ImagesProcessor,
    {
      provide: ImageStorage,
      useClass: S3ImageStorage,
    },
  ],
  controllers: [ImagesController],
})
export class ImagesModule {}
