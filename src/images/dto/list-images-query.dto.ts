import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

import {
  DEFAULT_IMAGES_LIMIT,
  DEFAULT_IMAGES_PAGE,
  MAX_IMAGES_LIMIT,
} from '@/images/image-pagination.constants';

export class ListImagesQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = DEFAULT_IMAGES_PAGE;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_IMAGES_LIMIT)
  size: number = DEFAULT_IMAGES_LIMIT;
}
