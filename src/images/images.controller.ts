import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto, ListImagesQueryDto } from './dto/image.dto';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  async createImage(@Body() body: CreateImageDto) {
    const image = await this.imagesService.create({
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
