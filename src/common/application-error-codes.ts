export const APPLICATION_ERROR_CODES = {
  INVALID_IMAGE_FILE: 'invalid_image_file',
  IMAGE_STORAGE_ERROR: 'image_storage_error',
  IMAGE_NOT_FOUND: 'not_found',
} as const;

export type ApplicationErrorCode =
  (typeof APPLICATION_ERROR_CODES)[keyof typeof APPLICATION_ERROR_CODES];
