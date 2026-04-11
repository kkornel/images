import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_UPLOAD_SIZE_BYTES } from '../images.config';

export const ImageUploadInterceptor = FileInterceptor('file', {
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
  },
});
