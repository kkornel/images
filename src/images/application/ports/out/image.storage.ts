export interface StoreImageInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export abstract class ImageStorage {
  abstract upload(input: StoreImageInput): Promise<void>;
  abstract delete(key: string): Promise<void>;
}
