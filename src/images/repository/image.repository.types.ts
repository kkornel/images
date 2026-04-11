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
