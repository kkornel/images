import { Test, TestingModule } from '@nestjs/testing';

import { APPLICATION_ERROR_CODES } from '@/common/application-error-codes';
import { ApplicationException } from '@/common/application.exception';
import { ImageRepository } from '@/images/application/ports/out/image.repository';
import { ImageStorage } from '@/images/application/ports/out/image.storage';
import type { Image } from '@/images/domain/image';
import { DeleteImageService } from '@/images/application/use-cases/delete-image.service';

function makeImage(overrides: Partial<Image> = {}): Image {
  return {
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Cat',
    storageKey: '550e8400-e29b-41d4-a716-446655440000.jpg',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    width: 1920,
    height: 1080,
    size: 123456,
    createdAt: new Date('2025-01-01T10:00:00.000Z'),
    updatedAt: new Date('2025-01-01T10:00:00.000Z'),
    ...overrides,
  };
}

describe('DeleteImageService', () => {
  let service: DeleteImageService;

  const imageRepositoryMock: jest.Mocked<ImageRepository> = {
    create: jest.fn(),
    findByUuid: jest.fn(),
    findAll: jest.fn(),
    deleteByUuid: jest.fn(),
  };

  const imageStorageMock: jest.Mocked<ImageStorage> = {
    upload: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteImageService,
        {
          provide: ImageRepository,
          useValue: imageRepositoryMock,
        },
        {
          provide: ImageStorage,
          useValue: imageStorageMock,
        },
      ],
    }).compile();

    service = module.get<DeleteImageService>(DeleteImageService);
  });

  it('deletes the image record and then deletes the stored file', async () => {
    const image = makeImage();

    imageRepositoryMock.findByUuid.mockResolvedValue(image);
    imageRepositoryMock.deleteByUuid.mockResolvedValue();
    imageStorageMock.delete.mockResolvedValue();

    await expect(
      service.execute({ uuid: image.uuid }),
    ).resolves.toBeUndefined();

    expect(imageRepositoryMock.findByUuid).toHaveBeenCalledWith(image.uuid);
    expect(imageRepositoryMock.deleteByUuid).toHaveBeenCalledWith(image.uuid);
    expect(imageStorageMock.delete).toHaveBeenCalledWith(image.storageKey);
  });

  it('throws not_found when the image does not exist', async () => {
    const missingUuid = '550e8400-e29b-41d4-a716-446655440001';

    imageRepositoryMock.findByUuid.mockResolvedValue(null);

    await expect(
      service.execute({
        uuid: missingUuid,
      }),
    ).rejects.toEqual(
      new ApplicationException(
        APPLICATION_ERROR_CODES.IMAGE_NOT_FOUND,
        `Image with uuid ${missingUuid} was not found`,
      ),
    );

    expect(imageRepositoryMock.deleteByUuid).not.toHaveBeenCalled();
    expect(imageStorageMock.delete).not.toHaveBeenCalled();
  });

  it('does not attempt storage deletion when repository deletion fails', async () => {
    const image = makeImage();
    const repositoryError = new Error('Database delete failed');

    imageRepositoryMock.findByUuid.mockResolvedValue(image);
    imageRepositoryMock.deleteByUuid.mockRejectedValue(repositoryError);

    await expect(service.execute({ uuid: image.uuid })).rejects.toThrow(
      repositoryError,
    );

    expect(imageStorageMock.delete).not.toHaveBeenCalled();
  });

  it('preserves success when storage cleanup fails after deleting the record', async () => {
    const image = makeImage();
    const storageError = new Error('S3 delete failed');

    imageRepositoryMock.findByUuid.mockResolvedValue(image);
    imageRepositoryMock.deleteByUuid.mockResolvedValue();
    imageStorageMock.delete.mockRejectedValue(storageError);

    await expect(
      service.execute({ uuid: image.uuid }),
    ).resolves.toBeUndefined();

    expect(imageRepositoryMock.deleteByUuid).toHaveBeenCalledWith(image.uuid);
    expect(imageStorageMock.delete).toHaveBeenCalledWith(image.storageKey);
  });
});
