export interface StoreImageInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export abstract class ImageStorage {
  abstract upload(input: StoreImageInput): Promise<void>;
  abstract resolveUrl(key: string): string;
  abstract delete(key: string): Promise<void>;
}
