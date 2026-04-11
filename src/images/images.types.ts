export interface CreateImageInput {
  file: Buffer;
  title: string;
  width: number;
  height: number;
}

export interface CreateImageRecord {
  uuid: string;
  title: string;
  storageKey: string;
  mimeType: string;
  extension: string;
  width: number;
  height: number;
  size: number;
}

export interface PersistedImage {
  uuid: string;
  title: string;
  storageKey: string;
  mimeType: string;
  extension: string;
  width: number;
  height: number;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  uuid: string;
  title: string;
  url: string;
  mimeType: string;
  extension: string;
  width: number;
  height: number;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListImagesParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
