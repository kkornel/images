import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ErrorResponseDto } from '@/common/error-response.dto';

export function DeleteImageDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete an image by UUID',
      description:
        'Deletes the image metadata record and attempts to remove the stored image file.',
    }),
    ApiParam({
      name: 'uuid',
      type: String,
      format: 'uuid',
      description: 'Unique identifier of the image to delete.',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiNoContentResponse({
      description: 'The image was deleted successfully.',
    }),
    ApiBadRequestResponse({
      description: 'The provided UUID is not a valid UUID value.',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'The request is missing a valid API key.',
      type: ErrorResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'No image exists for the provided UUID.',
      type: ErrorResponseDto,
    }),
  );
}
