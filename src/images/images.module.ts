import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { ImageOrmEntity } from './entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImageOrmEntity])],
  providers: [ImagesService],
  controllers: [ImagesController],
})
export class ImagesModule {}
