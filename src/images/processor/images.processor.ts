import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import type {
  ProcessedImage,
  ProcessImageInput,
} from './images.processor.types';
import { InvalidImageFileException } from '../errors/invalid-image-file.exception';

const JPEG_QUALITY = 82;

@Injectable()
export class ImagesProcessor {
  async process(input: ProcessImageInput): Promise<ProcessedImage> {
    try {
      const { data, info } = await sharp(input.fileBuffer)
        .rotate()
        .resize({
          width: input.targetWidth,
          height: input.targetHeight,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: JPEG_QUALITY,
          mozjpeg: true,
        })
        .toBuffer({
          resolveWithObject: true,
        });

      if (!info.width || !info.height) {
        throw new InvalidImageFileException(
          'Unable to determine processed image dimensions.',
        );
      }

      return {
        buffer: data,
        width: info.width,
        height: info.height,
        mimeType: 'image/jpeg',
        extension: 'jpg',
        size: data.byteLength,
      };
    } catch (error) {
      if (error instanceof InvalidImageFileException) {
        throw error;
      }

      throw new InvalidImageFileException(
        'Uploaded file is not a supported image or could not be processed.',
      );
    }
  }
}
