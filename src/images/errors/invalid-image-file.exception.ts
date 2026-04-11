import { APPLICATION_ERROR_CODES } from '@/common/application-error-codes';
import { ApplicationException } from '@/common/application.exception';

export class InvalidImageFileException extends ApplicationException {
  constructor(message: string) {
    super(APPLICATION_ERROR_CODES.INVALID_IMAGE_FILE, message);
  }
}
