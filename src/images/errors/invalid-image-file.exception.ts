import { ApplicationException } from 'src/common/application.exception';

export class InvalidImageFileException extends ApplicationException {
  constructor(message: string) {
    super('invalid_image_file', message);
  }
}
