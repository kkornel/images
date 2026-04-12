import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ImagesService } from './images.service';
import {
  ImageProcessor,
  type ProcessedImage,
} from './processor/image.processor';
import { ImageRepository } from './repository/image.repository';
import type { PersistedImage } from './repository/image.repository.types';
import { ImageStorage } from './storage/image.storage';
import type { Image } from './types/image.model';
import type { PaginatedResult } from './types/paginated-result.type';

function makeProcessedImage(
  overrides: Partial<ProcessedImage> = {},
): ProcessedImage {
  return {
    buffer: Buffer.from('normalized-image-content'),
    width: 1200,
    height: 800,
    mimeType: 'image/jpeg',
    extension: 'jpg',
    size: 654321,
    ...overrides,
  };
}

function makePersistedImage(
  overrides: Partial<PersistedImage> = {},
): PersistedImage {
  return {
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Dog',
    storageKey: '550e8400-e29b-41d4-a716-446655440000.jpg',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    width: 1200,
    height: 800,
    size: 654321,
    createdAt: new Date('2025-01-01T10:00:00.000Z'),
    updatedAt: new Date('2025-01-01T10:00:00.000Z'),
    ...overrides,
  };
}

function toExpectedImage(persistedImage: PersistedImage): Image {
  return {
    uuid: persistedImage.uuid,
    title: persistedImage.title,
    url: `https://cdn.example.com/${persistedImage.storageKey}`,
    mimeType: persistedImage.mimeType,
    extension: persistedImage.extension,
    width: persistedImage.width,
    height: persistedImage.height,
    size: persistedImage.size,
    createdAt: persistedImage.createdAt,
    updatedAt: persistedImage.updatedAt,
  };
}

describe('ImagesService', () => {
  let service: ImagesService;

  const imageRepositoryMock: jest.Mocked<ImageRepository> = {
    create: jest.fn(),
    findByUuid: jest.fn(),
    findAll: jest.fn(),
  };

  const imageProcessorMock: jest.Mocked<ImageProcessor> = {
    process: jest.fn(),
  };

  const imageStorageMock: jest.Mocked<ImageStorage> = {
    upload: jest.fn(),
    resolveUrl: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    imageStorageMock.resolveUrl.mockImplementation(
      (key: string) => 'https://cdn.example.com/' + key,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: ImageRepository,
          useValue: imageRepositoryMock,
        },
        {
          provide: ImageProcessor,
          useValue: imageProcessorMock,
        },
        {
          provide: ImageStorage,
          useValue: imageStorageMock,
        },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
  });

  describe('create', () => {
    it('processes the image, uploads it, persists it and maps the result', async () => {
      const input = {
        fileBuffer: Buffer.from('original-image-content'),
        title: 'Cat',
        width: 1920,
        height: 1080,
      };
      const processedImage = makeProcessedImage();
      const createdAt = new Date('2025-01-01T10:00:00.000Z');
      const updatedAt = new Date('2025-01-01T10:05:00.000Z');

      imageProcessorMock.process.mockResolvedValue(processedImage);
      imageStorageMock.upload.mockResolvedValue();
      imageRepositoryMock.create.mockImplementation((image) =>
        Promise.resolve({
          ...image,
          createdAt,
          updatedAt,
        }),
      );

      const result = await service.create(input);

      expect(imageProcessorMock.process.mock.calls).toEqual([
        [
          {
            fileBuffer: input.fileBuffer,
            targetWidth: input.width,
            targetHeight: input.height,
          },
        ],
      ]);

      expect(imageStorageMock.upload.mock.calls).toHaveLength(1);
      expect(imageRepositoryMock.create.mock.calls).toHaveLength(1);

      const uploadArgument = imageStorageMock.upload.mock.calls[0]?.[0];
      const createArgument = imageRepositoryMock.create.mock.calls[0]?.[0];

      expect(uploadArgument).toBeDefined();
      expect(createArgument).toBeDefined();

      expect(createArgument.uuid).toEqual(expect.any(String));
      expect(createArgument.storageKey).toBe(
        createArgument.uuid + '.' + processedImage.extension,
      );
      expect(createArgument).toMatchObject({
        title: input.title,
        mimeType: processedImage.mimeType,
        extension: processedImage.extension,
        width: processedImage.width,
        height: processedImage.height,
        size: processedImage.size,
      });
      expect(uploadArgument).toEqual({
        key: createArgument.storageKey,
        body: processedImage.buffer,
        contentType: processedImage.mimeType,
      });
      expect(imageStorageMock.resolveUrl.mock.calls).toEqual([
        [createArgument.storageKey],
      ]);
      expect(result).toEqual({
        uuid: createArgument.uuid,
        title: input.title,
        url: 'https://cdn.example.com/' + createArgument.storageKey,
        mimeType: processedImage.mimeType,
        extension: processedImage.extension,
        width: processedImage.width,
        height: processedImage.height,
        size: processedImage.size,
        createdAt,
        updatedAt,
      });
    });

    it('propagates upload errors without persisting or rolling back', async () => {
      const uploadError = new Error('S3 is unavailable');

      imageProcessorMock.process.mockResolvedValue(makeProcessedImage());
      imageStorageMock.upload.mockRejectedValue(uploadError);

      await expect(
        service.create({
          fileBuffer: Buffer.from('original-image-content'),
          title: 'Cat',
          width: 1920,
          height: 1080,
        }),
      ).rejects.toThrow(uploadError);

      expect(imageRepositoryMock.create.mock.calls).toHaveLength(0);
      expect(imageStorageMock.delete.mock.calls).toHaveLength(0);
    });

    it('rolls back the uploaded file when persistence fails', async () => {
      const repositoryError = new Error('Database write failed');

      imageProcessorMock.process.mockResolvedValue(makeProcessedImage());
      imageStorageMock.upload.mockResolvedValue();
      imageRepositoryMock.create.mockRejectedValue(repositoryError);
      imageStorageMock.delete.mockResolvedValue();

      await expect(
        service.create({
          fileBuffer: Buffer.from('original-image-content'),
          title: 'Cat',
          width: 1920,
          height: 1080,
        }),
      ).rejects.toThrow(repositoryError);

      const uploadArgument = imageStorageMock.upload.mock.calls[0]?.[0];

      expect(uploadArgument).toBeDefined();

      expect(imageStorageMock.delete.mock.calls).toEqual([
        [uploadArgument.key],
      ]);
    });

    it('preserves the original persistence error when rollback fails', async () => {
      const repositoryError = new Error('Database write failed');
      const rollbackError = new Error('S3 delete failed');

      imageProcessorMock.process.mockResolvedValue(makeProcessedImage());
      imageStorageMock.upload.mockResolvedValue();
      imageRepositoryMock.create.mockRejectedValue(repositoryError);
      imageStorageMock.delete.mockRejectedValue(rollbackError);

      await expect(
        service.create({
          fileBuffer: Buffer.from('original-image-content'),
          title: 'Cat',
          width: 1920,
          height: 1080,
        }),
      ).rejects.toThrow(repositoryError);

      expect(imageStorageMock.delete.mock.calls).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns the mapped image when it exists', async () => {
      const persistedImage = makePersistedImage();

      imageRepositoryMock.findByUuid.mockResolvedValue(persistedImage);

      const result = await service.findOne(persistedImage.uuid);

      expect(imageRepositoryMock.findByUuid.mock.calls).toEqual([
        [persistedImage.uuid],
      ]);
      expect(imageStorageMock.resolveUrl.mock.calls).toEqual([
        [persistedImage.storageKey],
      ]);
      expect(result).toEqual(toExpectedImage(persistedImage));
    });

    it('throws NotFoundException when the image does not exist', async () => {
      imageRepositoryMock.findByUuid.mockResolvedValue(null);

      await expect(service.findOne('missing-uuid')).rejects.toThrow(
        new NotFoundException('Image with uuid "missing-uuid" was not found'),
      );
      expect(imageRepositoryMock.findByUuid.mock.calls).toEqual([
        ['missing-uuid'],
      ]);
    });
  });

  describe('findAll', () => {
    it('returns a mapped paginated result', async () => {
      const persistedImages = [
        makePersistedImage(),
        makePersistedImage({
          uuid: '7b839a38-cf08-4213-a307-2fa9ad092fd8',
          title: 'Forest',
          storageKey: '7b839a38-cf08-4213-a307-2fa9ad092fd8.jpg',
        }),
      ];
      const repositoryResult: PaginatedResult<PersistedImage> = {
        items: persistedImages,
        total: 2,
        page: 2,
        limit: 5,
        totalPages: 3,
      };

      imageRepositoryMock.findAll.mockResolvedValue(repositoryResult);

      const result = await service.findAll({ page: 2, limit: 5 });

      expect(imageRepositoryMock.findAll.mock.calls).toEqual([
        [
          {
            page: 2,
            limit: 5,
          },
        ],
      ]);
      expect(result).toEqual({
        items: persistedImages.map((image) => toExpectedImage(image)),
        total: repositoryResult.total,
        page: repositoryResult.page,
        limit: repositoryResult.limit,
        totalPages: repositoryResult.totalPages,
      });
    });
  });
});
