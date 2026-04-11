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
import type { Express } from 'express';
import { ApiTags } from '@nestjs/swagger';

import type { Image } from '@/images/types/image.model';
import type { PaginatedResult } from '@/images/types/paginated-result.type';
import { CreateImageDto } from '@/images/dto/create-image.dto';
import { ListImagesQueryDto } from '@/images/dto/list-images-query.dto';
import { ImageUploadInterceptor } from '@/images/interceptors/image-upload.interceptor';
import { ImagesService } from '@/images/images.service';
import { ImageFileValidationPipe } from '@/images/pipes/image-file-validation.pipe';
import { CreateImageDocs } from '@/images/docs/create-image.docs';
import { GetImageDocs } from '@/images/docs/get-image.docs';
import { ListImagesDocs } from '@/images/docs/list-images.docs';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @CreateImageDocs()
  @UseInterceptors(ImageUploadInterceptor)
  async create(
    @UploadedFile(ImageFileValidationPipe) file: Express.Multer.File,
    @Body() body: CreateImageDto,
  ): Promise<Image> {
    return this.imagesService.create({
      fileBuffer: file.buffer,
      title: body.title,
      width: body.width,
      height: body.height,
    });
  }

  @Get(':uuid')
  @GetImageDocs()
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string): Promise<Image> {
    return this.imagesService.findOne(uuid);
  }

  @Get()
  @ListImagesDocs()
  async findAll(
    @Query() query: ListImagesQueryDto,
  ): Promise<PaginatedResult<Image>> {
    return this.imagesService.findAll({
      page: query.page,
      limit: query.size,
    });
  }
}
