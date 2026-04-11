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
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4000)
  width: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4000)
  height: number;
}
