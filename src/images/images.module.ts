import { Module } from '@nestjs/common';

import { CreateImageUseCase } from '@/images/application/ports/in/create-image.use-case';
import { GetImageUseCase } from '@/images/application/ports/in/get-image.use-case';
import { ListImagesUseCase } from '@/images/application/ports/in/list-images.use-case';
import { CreateImageService } from '@/images/application/use-cases/create-image.service';
import { GetImageService } from '@/images/application/use-cases/get-image.service';
import { ListImagesService } from '@/images/application/use-cases/list-images.service';
import { ImagesController } from '@/images/presentation/http/images.controller';
import { ImagesInfrastructureModule } from '@/images/infrastructure/images-infrastructure.module';

@Module({
  imports: [ImagesInfrastructureModule],
  controllers: [ImagesController],
  providers: [
    {
      provide: CreateImageUseCase,
      useClass: CreateImageService,
    },
    {
      provide: GetImageUseCase,
      useClass: GetImageService,
    },
    {
      provide: ListImagesUseCase,
      useClass: ListImagesService,
    },
  ],
})
export class ImagesModule {}
