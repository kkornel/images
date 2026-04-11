export interface StoreImageObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export abstract class ImageStorage {
  abstract upload(input: StoreImageObjectInput): Promise<void>;
  abstract resolveUrl(key: string): string;
  abstract delete(key: string): Promise<void>;
}
