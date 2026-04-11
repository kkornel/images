export interface ProcessImageInput {
  fileBuffer: Buffer;
  targetWidth: number;
  targetHeight: number;
}

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: string;
  extension: string;
  size: number;
}
