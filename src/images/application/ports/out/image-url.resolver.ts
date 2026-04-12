export abstract class ImageUrlResolver {
  abstract resolveUrl(storageKey: string): string;
}
