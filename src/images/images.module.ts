import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { ImagesRepository } from './images.repository';
import { ImageOrmEntity } from './entities/image.entity';
import { ImagesProcessor } from './processor/images.processor';

@Module({
  imports: [TypeOrmModule.forFeature([ImageOrmEntity])],
  providers: [ImagesService, ImagesRepository, ImagesProcessor],
  controllers: [ImagesController],
})
export class ImagesModule {}
