import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  DEFAULT_IMAGES_LIMIT,
  DEFAULT_IMAGES_PAGE,
  MAX_IMAGES_LIMIT,
} from '@/images/image-pagination.constants';

export class ListImagesQueryDto {
  @ApiPropertyOptional({
    description: 'Page number to return. Starts at 1.',
    example: DEFAULT_IMAGES_PAGE,
    minimum: 1,
    default: DEFAULT_IMAGES_PAGE,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = DEFAULT_IMAGES_PAGE;

  @ApiPropertyOptional({
    description: 'Maximum number of images to return per page.',
    example: DEFAULT_IMAGES_LIMIT,
    minimum: 1,
    maximum: MAX_IMAGES_LIMIT,
    default: DEFAULT_IMAGES_LIMIT,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_IMAGES_LIMIT)
  size: number = DEFAULT_IMAGES_LIMIT;
}
