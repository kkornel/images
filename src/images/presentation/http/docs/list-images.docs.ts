import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

import { ErrorResponseDto } from '@/common/error-response.dto';
import { PaginatedImagesResponseDto } from '@/images/presentation/http/dto/image-response.dto';

export function ListImagesDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'List images',
      description:
        'Returns a paginated list of stored images ordered by creation time.',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number to retrieve.',
      example: 1,
    }),
    ApiQuery({
      name: 'size',
      required: false,
      type: Number,
      description: 'Number of items per page.',
      example: 20,
    }),
    ApiOkResponse({
      description: 'A paginated list of image resources.',
      type: PaginatedImagesResponseDto,
    }),
    ApiBadRequestResponse({
      description:
        'Pagination query parameters are invalid. This happens when page is less than 1 or size is outside the allowed range.',
      type: ErrorResponseDto,
    }),
  );
}
