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
import { ImagesService } from './images.service';
import { CreateImageDto, ListImagesQueryDto } from './dto/image.dto';
import { ImageFileValidationPipe } from './pipes/image-file-validation.pipe';
import { ImageUploadInterceptor } from './interceptors/image-upload.interceptor';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(ImageUploadInterceptor)
  async createImage(
    @UploadedFile(ImageFileValidationPipe) file: Express.Multer.File,
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
