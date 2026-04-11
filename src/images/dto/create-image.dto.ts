import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    description: 'Human-readable image title.',
    example: 'Sunset over the mountains',
    maxLength: 255,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description:
      'Requested maximum output width in pixels. The image is resized to fit within this bound without enlargement.',
    example: 1920,
    minimum: 1,
    maximum: 4000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4000)
  width: number;

  @ApiProperty({
    description:
      'Requested maximum output height in pixels. The image is resized to fit within this bound without enlargement.',
    example: 1080,
    minimum: 1,
    maximum: 4000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4000)
  height: number;
}
