import { ApiProperty } from '@nestjs/swagger';

import { CreateImageDto } from './create-image.dto';

export class CreateImageUploadRequestDto extends CreateImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description:
      'Image file to upload. Supported formats: JPEG, PNG, and WebP. Maximum size: 10 MB.',
  })
  file: unknown;
}
