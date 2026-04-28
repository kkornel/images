import { Test, TestingModule } from '@nestjs/testing';

import { CreateImageUseCase } from '@/images/application/ports/in/create-image.use-case';
import { DeleteImageUseCase } from '@/images/application/ports/in/delete-image.use-case';
import { GetImageUseCase } from '@/images/application/ports/in/get-image.use-case';
import { ListImagesUseCase } from '@/images/application/ports/in/list-images.use-case';
import type { ImageResult } from '@/images/application/results/image.result';
import type { PaginatedResult } from '@/images/application/results/paginated-result';

import { CreateImageDto } from './dto/create-image.dto';
import { ListImagesQueryDto } from './dto/list-images-query.dto';
import { ImagesController } from './images.controller';
import { ImagesApiKeyGuard } from './guards/images-api-key.guard';

function makeImageResult(overrides: Partial<ImageResult> = {}): ImageResult {
  return {
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Cat',
    url: 'https://cdn.example.com/550e8400-e29b-41d4-a716-446655440000.jpg',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    width: 1024,
    height: 800,
    size: 123456,
    createdAt: new Date('2025-01-01T10:00:00.000Z'),
    updatedAt: new Date('2025-01-01T10:00:00.000Z'),
    ...overrides,
  };
}

function toImageResponseDto(image: ImageResult) {
  return {
    uuid: image.uuid,
    title: image.title,
    url: image.url,
    mimeType: image.mimeType,
    extension: image.extension,
    width: image.width,
    height: image.height,
    size: image.size,
    createdAt: image.createdAt.toISOString(),
    updatedAt: image.updatedAt.toISOString(),
  };
}

describe('ImagesController', () => {
  let controller: ImagesController;

  const createImageUseCaseMock: jest.Mocked<CreateImageUseCase> = {
    execute: jest.fn(),
  };

  const getImageUseCaseMock: jest.Mocked<GetImageUseCase> = {
    execute: jest.fn(),
  };

  const deleteImageUseCaseMock: jest.Mocked<DeleteImageUseCase> = {
    execute: jest.fn(),
  };

  const listImagesUseCaseMock: jest.Mocked<ListImagesUseCase> = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleBuilder = Test.createTestingModule({
      controllers: [ImagesController],
      providers: [
        {
          provide: CreateImageUseCase,
          useValue: createImageUseCaseMock,
        },
        {
          provide: GetImageUseCase,
          useValue: getImageUseCaseMock,
        },
        {
          provide: DeleteImageUseCase,
          useValue: deleteImageUseCaseMock,
        },
        {
          provide: ListImagesUseCase,
          useValue: listImagesUseCaseMock,
        },
      ],
    });

    moduleBuilder.overrideGuard(ImagesApiKeyGuard).useValue({
      canActivate: () => true,
    });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<ImagesController>(ImagesController);
  });

  describe('create', () => {
    it('delegates the uploaded file buffer and body fields to the create use case', async () => {
      const fileBuffer = Buffer.from('uploaded-image-content');
      const file = {
        buffer: fileBuffer,
      } as Express.Multer.File;
      const body: CreateImageDto = {
        title: 'Cat',
        width: 1024,
        height: 800,
      };
      const createdImage = makeImageResult();

      createImageUseCaseMock.execute.mockResolvedValue(createdImage);

      const result = await controller.create(file, body);

      expect(createImageUseCaseMock.execute).toHaveBeenCalledWith({
        fileBuffer,
        title: body.title,
        width: body.width,
        height: body.height,
      });
      expect(result).toEqual(toImageResponseDto(createdImage));
    });
  });

  describe('findOne', () => {
    it('delegates the uuid to the get use case and returns a mapped DTO', async () => {
      const image = makeImageResult();

      getImageUseCaseMock.execute.mockResolvedValue(image);

      const result = await controller.findOne(image.uuid);

      expect(getImageUseCaseMock.execute).toHaveBeenCalledWith({
        uuid: image.uuid,
      });
      expect(result).toEqual(toImageResponseDto(image));
    });
  });

  describe('findAll', () => {
    it('maps query size to limit before delegating to the list use case', async () => {
      const query: ListImagesQueryDto = {
        page: 2,
        size: 5,
      };
      const paginatedImages: PaginatedResult<ImageResult> = {
        items: [makeImageResult()],
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
      };

      listImagesUseCaseMock.execute.mockResolvedValue(paginatedImages);

      const result = await controller.findAll(query);

      expect(listImagesUseCaseMock.execute).toHaveBeenCalledWith({
        page: query.page,
        limit: query.size,
      });
      expect(result).toEqual({
        items: paginatedImages.items.map((image) => toImageResponseDto(image)),
        total: paginatedImages.total,
        page: paginatedImages.page,
        limit: paginatedImages.limit,
        totalPages: paginatedImages.totalPages,
      });
    });
  });
});
