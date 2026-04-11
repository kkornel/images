import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code returned for the error response.',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Application-specific or normalized HTTP error code.',
    example: 'bad_request',
  })
  code: string;

  @ApiProperty({
    description: 'Human-readable error message describing what went wrong.',
    example: 'Request validation failed.',
  })
  message: string;

  @ApiPropertyOptional({
    description:
      'Additional structured error details. Its shape depends on the error type.',
    type: 'object',
    additionalProperties: true,
    example: {
      error: 'Bad Request',
      message: ['width must not be greater than 4000'],
      statusCode: 400,
    },
  })
  details?: Record<string, unknown>;
}
