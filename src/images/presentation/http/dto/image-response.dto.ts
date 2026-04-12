import { ApiProperty } from '@nestjs/swagger';

export class ImageResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the image.',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  uuid: string;

  @ApiProperty({
    description: 'Human-readable title assigned to the image.',
    example: 'Sunset over the mountains',
    maxLength: 255,
  })
  title: string;

  @ApiProperty({
    description: 'Publicly resolvable URL for the stored image.',
    example:
      'https://images-bucket.eu-central-1.amazonaws.com/550e8400-e29b-41d4-a716-446655440000.jpg',
    format: 'uri',
  })
  url: string;

  @ApiProperty({
    description: 'MIME type of the normalized stored image.',
    example: 'image/jpeg',
  })
  mimeType: string;

  @ApiProperty({
    description: 'File extension of the normalized stored image.',
    example: 'jpg',
  })
  extension: string;

  @ApiProperty({
    description: 'Final image width in pixels after normalization.',
    example: 1200,
    minimum: 1,
  })
  width: number;

  @ApiProperty({
    description: 'Final image height in pixels after normalization.',
    example: 800,
    minimum: 1,
  })
  height: number;

  @ApiProperty({
    description: 'Final image size in bytes.',
    example: 654321,
    minimum: 0,
  })
  size: number;

  @ApiProperty({
    description: 'Timestamp when the image metadata record was created.',
    example: '2025-01-01T10:00:00.000Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Timestamp when the image metadata record was last updated.',
    example: '2025-01-01T10:05:00.000Z',
    format: 'date-time',
  })
  updatedAt: string;
}

export class PaginatedImagesResponseDto {
  @ApiProperty({
    description: 'List of images for the current page.',
    type: () => [ImageResponseDto],
  })
  items: ImageResponseDto[];

  @ApiProperty({
    description: 'Total number of available images across all pages.',
    example: 42,
    minimum: 0,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number.',
    example: 1,
    minimum: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Maximum number of items returned per page.',
    example: 20,
    minimum: 1,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of available pages.',
    example: 3,
    minimum: 0,
  })
  totalPages: number;
}
