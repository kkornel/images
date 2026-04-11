import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

import {
  DEFAULT_IMAGES_LIMIT,
  DEFAULT_IMAGES_PAGE,
  MAX_IMAGES_LIMIT,
} from '@/images/image-pagination.constants';

export class ListImagesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  size?: number;
}
