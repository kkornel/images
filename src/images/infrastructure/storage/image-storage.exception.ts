import { APPLICATION_ERROR_CODES } from '@/common/application-error-codes';
import { ApplicationException } from '@/common/application.exception';

export class ImageStorageException extends ApplicationException {
  constructor(operation: 'upload' | 'delete', reason?: string) {
    super(
      APPLICATION_ERROR_CODES.IMAGE_STORAGE_ERROR,
      `Unable to ${operation} image content.`,
      reason ? { reason } : undefined,
    );
  }
}
