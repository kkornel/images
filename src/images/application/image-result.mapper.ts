import { ImageUrlResolver } from '@/images/application/ports/out/image-url.resolver';
import type { ImageResult } from '@/images/application/results/image.result';
import type { Image } from '@/images/domain/image';

export function toImageResult(
  image: Image,
  imageUrlResolver: ImageUrlResolver,
): ImageResult {
  return {
    uuid: image.uuid,
    title: image.title,
    url: imageUrlResolver.resolveUrl(image.storageKey),
    mimeType: image.mimeType,
    extension: image.extension,
    width: image.width,
    height: image.height,
    size: image.size,
    createdAt: image.createdAt,
    updatedAt: image.updatedAt,
  };
}
