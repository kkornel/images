import { Test, TestingModule } from '@nestjs/testing';

import { ImageUrlResolver } from '@/images/application/ports/out/image-url.resolver';
import type { ImageResult } from '@/images/application/results/image.result';
import {
  ImageProcessor,
  type ProcessedImage,
} from '@/images/application/ports/out/image.processor';
import { ImageRepository } from '@/images/application/ports/out/image.repository';
import type { Image } from '@/images/domain/image';
import { ImageStorage } from '@/images/application/ports/out/image.storage';
import { CreateImageService } from '@/images/application/use-cases/create-image.service';

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

function makeImage(overrides: Partial<Image> = {}): Image {
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

function toExpectedImage(image: Image): ImageResult {
  return {
    uuid: image.uuid,
    title: image.title,
    url: `https://cdn.example.com/${image.storageKey}`,
    mimeType: image.mimeType,
    extension: image.extension,
    width: image.width,
    height: image.height,
    size: image.size,
    createdAt: image.createdAt,
    updatedAt: image.updatedAt,
  };
}

describe('CreateImageService', () => {
  let service: CreateImageService;

  const imageRepositoryMock: jest.Mocked<ImageRepository> = {
    create: jest.fn(),
    findByUuid: jest.fn(),
    findAll: jest.fn(),
    deleteByUuid: jest.fn(),
  };

  const imageProcessorMock: jest.Mocked<ImageProcessor> = {
    process: jest.fn(),
  };

  const imageStorageMock: jest.Mocked<ImageStorage> = {
    upload: jest.fn(),
    delete: jest.fn(),
  };

  const imageUrlResolverMock: jest.Mocked<ImageUrlResolver> = {
    resolveUrl: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    imageUrlResolverMock.resolveUrl.mockImplementation(
      (key: string) => `https://cdn.example.com/${key}`,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateImageService,
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
        {
          provide: ImageUrlResolver,
          useValue: imageUrlResolverMock,
        },
      ],
    }).compile();

    service = module.get<CreateImageService>(CreateImageService);
  });

  it('processes the image, uploads it, persists it and maps the result', async () => {
    const input = {
      fileBuffer: Buffer.from('original-image-content'),
      title: 'Cat',
      width: 1920,
      height: 1080,
    };
    const processedImage = makeProcessedImage();
    const image = makeImage();

    imageProcessorMock.process.mockResolvedValue(processedImage);
    imageStorageMock.upload.mockResolvedValue();
    imageRepositoryMock.create.mockResolvedValue(image);

    const result = await service.execute(input);

    expect(imageProcessorMock.process).toHaveBeenCalledWith({
      fileBuffer: input.fileBuffer,
      targetWidth: input.width,
      targetHeight: input.height,
    });
    expect(imageStorageMock.upload).toHaveBeenCalledTimes(1);
    expect(imageRepositoryMock.create).toHaveBeenCalledTimes(1);
    expect(imageUrlResolverMock.resolveUrl).toHaveBeenCalledWith(
      image.storageKey,
    );
    expect(result).toEqual(toExpectedImage(image));
  });

  it('propagates upload errors without persisting or rolling back', async () => {
    const uploadError = new Error('S3 is unavailable');

    imageProcessorMock.process.mockResolvedValue(makeProcessedImage());
    imageStorageMock.upload.mockRejectedValue(uploadError);

    await expect(
      service.execute({
        fileBuffer: Buffer.from('original-image-content'),
        title: 'Cat',
        width: 1920,
        height: 1080,
      }),
    ).rejects.toThrow(uploadError);

    expect(imageRepositoryMock.create).not.toHaveBeenCalled();
    expect(imageStorageMock.delete).not.toHaveBeenCalled();
  });

  it('rolls back the uploaded file when persistence fails', async () => {
    const repositoryError = new Error('Database write failed');

    imageProcessorMock.process.mockResolvedValue(makeProcessedImage());
    imageStorageMock.upload.mockResolvedValue();
    imageRepositoryMock.create.mockRejectedValue(repositoryError);
    imageStorageMock.delete.mockResolvedValue();

    await expect(
      service.execute({
        fileBuffer: Buffer.from('original-image-content'),
        title: 'Cat',
        width: 1920,
        height: 1080,
      }),
    ).rejects.toThrow(repositoryError);

    const uploadArgument = imageStorageMock.upload.mock.calls[0]?.[0];

    expect(uploadArgument).toBeDefined();
    expect(imageStorageMock.delete).toHaveBeenCalledWith(uploadArgument?.key);
  });

  it('preserves the original persistence error when rollback fails', async () => {
    const repositoryError = new Error('Database write failed');
    const rollbackError = new Error('S3 delete failed');

    imageProcessorMock.process.mockResolvedValue(makeProcessedImage());
    imageStorageMock.upload.mockResolvedValue();
    imageRepositoryMock.create.mockRejectedValue(repositoryError);
    imageStorageMock.delete.mockRejectedValue(rollbackError);

    await expect(
      service.execute({
        fileBuffer: Buffer.from('original-image-content'),
        title: 'Cat',
        width: 1920,
        height: 1080,
      }),
    ).rejects.toThrow(repositoryError);

    expect(imageStorageMock.delete).toHaveBeenCalledTimes(1);
  });
});
