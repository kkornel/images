export interface NewImage {
  uuid: string;
  title: string;
  storageKey: string;
  mimeType: string;
  extension: string;
  width: number;
  height: number;
  size: number;
}

export interface Image extends NewImage {
  createdAt: Date;
  updatedAt: Date;
}
