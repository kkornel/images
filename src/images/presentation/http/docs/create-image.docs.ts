import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ErrorResponseDto } from '@/common/error-response.dto';
import { CreateImageUploadRequestDto } from '@/images/presentation/http/dto/create-image-upload-request.dto';
import { ImageResponseDto } from '@/images/presentation/http/dto/image-response.dto';

export function CreateImageDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload and create an image',
      description:
        'Uploads a single image file, normalizes it, stores it, and creates the corresponding image metadata record.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description:
        'Multipart form data used to upload a single image and request normalized output dimensions.',
      type: CreateImageUploadRequestDto,
    }),
    ApiCreatedResponse({
      description:
        'The uploaded image was accepted, normalized, stored, and returned as an image resource.',
      type: ImageResponseDto,
    }),
    ApiBadRequestResponse({
      description:
        'The upload request is invalid. This can happen when required fields are missing, dimensions are out of range, the file is missing, or the uploaded file is not a supported image.',
      type: ErrorResponseDto,
    }),
  );
}
