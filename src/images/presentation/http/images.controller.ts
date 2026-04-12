import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Express } from 'express';

import { CreateImageUseCase } from '@/images/application/ports/in/create-image.use-case';
import { GetImageUseCase } from '@/images/application/ports/in/get-image.use-case';
import { ListImagesUseCase } from '@/images/application/ports/in/list-images.use-case';
import type { ImageResult } from '@/images/application/results/image.result';
import type { PaginatedResult } from '@/images/application/results/paginated-result';
import { CreateImageDocs } from '@/images/presentation/http/docs/create-image.docs';
import { GetImageDocs } from '@/images/presentation/http/docs/get-image.docs';
import { ListImagesDocs } from '@/images/presentation/http/docs/list-images.docs';
import { CreateImageDto } from '@/images/presentation/http/dto/create-image.dto';
import {
  ImageResponseDto,
  PaginatedImagesResponseDto,
} from '@/images/presentation/http/dto/image-response.dto';
import { ListImagesQueryDto } from '@/images/presentation/http/dto/list-images-query.dto';
import { ImageUploadInterceptor } from '@/images/presentation/http/interceptors/image-upload.interceptor';
import { ImageFileValidationPipe } from '@/images/presentation/http/pipes/image-file-validation.pipe';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(
    private readonly createImageUseCase: CreateImageUseCase,
    private readonly getImageUseCase: GetImageUseCase,
    private readonly listImagesUseCase: ListImagesUseCase,
  ) {}

  @Post()
  @CreateImageDocs()
  @UseInterceptors(ImageUploadInterceptor)
  async create(
    @UploadedFile(ImageFileValidationPipe) file: Express.Multer.File,
    @Body() body: CreateImageDto,
  ): Promise<ImageResponseDto> {
    const image = await this.createImageUseCase.execute({
      fileBuffer: file.buffer,
      title: body.title,
      width: body.width,
      height: body.height,
    });

    return this.toImageResponseDto(image);
  }

  @Get(':uuid')
  @GetImageDocs()
  async findOne(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ): Promise<ImageResponseDto> {
    const image = await this.getImageUseCase.execute({ uuid });

    return this.toImageResponseDto(image);
  }

  @Get()
  @ListImagesDocs()
  async findAll(
    @Query() query: ListImagesQueryDto,
  ): Promise<PaginatedImagesResponseDto> {
    const result = await this.listImagesUseCase.execute({
      page: query.page,
      limit: query.size,
    });

    return this.toPaginatedImagesResponseDto(result);
  }

  private toImageResponseDto(image: ImageResult): ImageResponseDto {
    return {
      uuid: image.uuid,
      title: image.title,
      url: image.url,
      mimeType: image.mimeType,
      extension: image.extension,
      width: image.width,
      height: image.height,
      size: image.size,
      createdAt: image.createdAt.toISOString(),
      updatedAt: image.updatedAt.toISOString(),
    };
  }

  private toPaginatedImagesResponseDto(
    result: PaginatedResult<ImageResult>,
  ): PaginatedImagesResponseDto {
    return {
      items: result.items.map((image) => this.toImageResponseDto(image)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
