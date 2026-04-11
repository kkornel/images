import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { ErrorResponseDto } from '@/common/error-response.dto';
import { ImageResponseDto } from '@/images/dto/image-response.dto';

export function GetImageDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get an image by UUID',
      description: 'Returns a single stored image resource by its UUID.',
    }),
    ApiParam({
      name: 'uuid',
      type: String,
      format: 'uuid',
      description: 'Unique identifier of the image to retrieve.',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiOkResponse({
      description: 'The requested image resource.',
      type: ImageResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'The provided UUID is not a valid UUID value.',
      type: ErrorResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'No image exists for the provided UUID.',
      type: ErrorResponseDto,
    }),
  );
}
