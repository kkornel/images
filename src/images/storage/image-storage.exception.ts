import { ApplicationException } from '@/common/application.exception';

export class ImageStorageException extends ApplicationException {
  constructor(operation: 'upload' | 'delete', reason?: string) {
    super(
      'image_storage_error',
      `Unable to ${operation} image content.`,
      reason ? { reason } : undefined,
    );
  }
}
