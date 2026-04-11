import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { CreateImageDto, ListImagesQueryDto } from './dto/image.dto';

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = /^image\/(jpeg|png|webp)$/i;

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_UPLOAD_SIZE_BYTES,
      },
    }),
  )
  async createImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: SUPPORTED_IMAGE_TYPES,
        })
        .addMaxSizeValidator({
          maxSize: MAX_UPLOAD_SIZE_BYTES,
        })
        .build({
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
    @Body() body: CreateImageDto,
  ) {
    const image = await this.imagesService.create({
      file: file.buffer,
      title: body.title,
      width: body.width,
      height: body.height,
    });

    return image;
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const image = await this.imagesService.findOne(id);

    return image;
  }

  @Get()
  async findAll(@Query() query: ListImagesQueryDto) {
    const result = await this.imagesService.findAll({
      page: query.page,
      limit: query.size,
    });

    return result;
  }
}
