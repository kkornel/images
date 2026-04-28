import { Module } from '@nestjs/common';

import { CreateImageService } from '@/images/application/use-cases/create-image.service';
import { CreateImageUseCase } from '@/images/application/ports/in/create-image.use-case';
import { DeleteImageService } from '@/images/application/use-cases/delete-image.service';
import { DeleteImageUseCase } from '@/images/application/ports/in/delete-image.use-case';
import { GetImageService } from '@/images/application/use-cases/get-image.service';
import { GetImageUseCase } from '@/images/application/ports/in/get-image.use-case';
import { ImagesController } from '@/images/presentation/http/images.controller';
import { ImagesInfrastructureModule } from '@/images/infrastructure/images-infrastructure.module';
import { ListImagesService } from '@/images/application/use-cases/list-images.service';
import { ListImagesUseCase } from '@/images/application/ports/in/list-images.use-case';

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
    {
      provide: DeleteImageUseCase,
      useClass: DeleteImageService,
    },
  ],
})
export class ImagesModule {}
