import { Test, TestingModule } from '@nestjs/testing';

import { CreateImageDto } from './dto/create-image.dto';
import { ListImagesQueryDto } from './dto/list-images-query.dto';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import type { Image } from './types/image.model';
import type { PaginatedResult } from './types/paginated-result.type';

function makeImage(overrides: Partial<Image> = {}): Image {
  return {
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Title',
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

describe('ImagesController', () => {
  let controller: ImagesController;

  const imagesServiceMock: jest.Mocked<
    Pick<ImagesService, 'create' | 'findOne' | 'findAll'>
  > = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [
        {
          provide: ImagesService,
          useValue: imagesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
  });

  describe('create', () => {
    it('delegates the uploaded file buffer and body fields to the service', async () => {
      const fileBuffer = Buffer.from('uploaded-image-content');
      const file = {
        buffer: fileBuffer,
      } as Express.Multer.File;
      const body: CreateImageDto = {
        title: 'Title',
        width: 1024,
        height: 800,
      };
      const createdImage = makeImage();

      imagesServiceMock.create.mockResolvedValue(createdImage);

      const result = await controller.create(file, body);

      expect(imagesServiceMock.create).toHaveBeenCalledWith({
        fileBuffer,
        title: body.title,
        width: body.width,
        height: body.height,
      });
      expect(result).toBe(createdImage);
    });
  });

  describe('findOne', () => {
    it('delegates the uuid to the service and returns the service result', async () => {
      const image = makeImage();

      imagesServiceMock.findOne.mockResolvedValue(image);

      const result = await controller.findOne(image.uuid);

      expect(imagesServiceMock.findOne).toHaveBeenCalledWith(image.uuid);
      expect(result).toBe(image);
    });
  });

  describe('findAll', () => {
    it('maps query size to limit before delegating to the service', async () => {
      const query: ListImagesQueryDto = {
        page: 2,
        size: 5,
      };
      const paginatedImages: PaginatedResult<Image> = {
        items: [makeImage()],
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
      };

      imagesServiceMock.findAll.mockResolvedValue(paginatedImages);

      const result = await controller.findAll(query);

      expect(imagesServiceMock.findAll).toHaveBeenCalledWith({
        page: query.page,
        limit: query.size,
      });
      expect(result).toBe(paginatedImages);
    });
  });
});
