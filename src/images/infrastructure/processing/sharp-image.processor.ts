import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

import {
  ImageProcessor,
  type ProcessedImage,
  type ProcessImageInput,
} from '@/images/application/ports/out/image.processor';
import { InvalidImageFileException } from '@/images/errors/invalid-image-file.exception';

const NORMALIZED_OUTPUT_MIME_TYPE = 'image/jpeg';
const NORMALIZED_OUTPUT_EXTENSION = 'jpg';
const NORMALIZED_JPEG_QUALITY = 82;

@Injectable()
export class SharpImageProcessor extends ImageProcessor {
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
          quality: NORMALIZED_JPEG_QUALITY,
          mozjpeg: true,
        })
        .toBuffer({
          resolveWithObject: true,
        });

      if (!info.width || !info.height) {
        throw new InvalidImageFileException(
          'Unable to determine normalized image dimensions.',
        );
      }

      return {
        buffer: data,
        width: info.width,
        height: info.height,
        mimeType: NORMALIZED_OUTPUT_MIME_TYPE,
        extension: NORMALIZED_OUTPUT_EXTENSION,
        size: data.byteLength,
      };
    } catch (error) {
      if (error instanceof InvalidImageFileException) {
        throw error;
      }

      throw new InvalidImageFileException(
        'Uploaded file is not a supported image or could not be normalized to JPEG.',
      );
    }
  }
}
