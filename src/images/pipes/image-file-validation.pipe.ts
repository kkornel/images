import { ParseFilePipeBuilder } from '@nestjs/common';
import {
  MAX_UPLOAD_SIZE_BYTES,
  SUPPORTED_IMAGE_TYPES,
} from '../image-upload.constants';

export const ImageFileValidationPipe = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: SUPPORTED_IMAGE_TYPES,
  })
  .addMaxSizeValidator({
    maxSize: MAX_UPLOAD_SIZE_BYTES,
  })
  .build({
    fileIsRequired: true,
  });
