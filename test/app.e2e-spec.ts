import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Server } from 'http';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { APPLICATION_ERROR_CODES } from '../src/common/application-error-codes';
import { ApplicationExceptionFilter } from '../src/common/application-exception.filter';
import { ApplicationException } from '../src/common/application.exception';
import { CreateImageUseCase } from '../src/images/application/ports/in/create-image.use-case';
import { DeleteImageUseCase } from '../src/images/application/ports/in/delete-image.use-case';
import { GetImageUseCase } from '../src/images/application/ports/in/get-image.use-case';
import { ListImagesUseCase } from '../src/images/application/ports/in/list-images.use-case';
import type { ImageResult } from '../src/images/application/results/image.result';
import type { PaginatedResult } from '../src/images/application/results/paginated-result';
import { InvalidImageFileException } from '../src/images/errors/invalid-image-file.exception';
import { ImagesController } from '../src/images/presentation/http/images.controller';
import { ImagesApiKeyGuard } from '../src/images/presentation/http/guards/images-api-key.guard';

type ErrorResponseBody = {
  statusCode: number;
  code: string;
  message: string | string[];
};

function makeImage(overrides: Partial<ImageResult> = {}): ImageResult {
  return {
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Cat',
    url: 'https://cdn.example.com/550e8400-e29b-41d4-a716-446655440000.jpg',
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

function makeValidPngBuffer(): Buffer {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn8q6cAAAAASUVORK5CYII=',
    'base64',
  );
}

function serializeImage(image: ImageResult) {
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

describe('Images HTTP API (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;

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

  beforeAll(async () => {
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

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new ApplicationExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /images', () => {
    it('uploads a file, validates input, transforms body values and returns the created image', async () => {
      const uploadedBuffer = makeValidPngBuffer();
      const createdImage = makeImage();

      createImageUseCaseMock.execute.mockResolvedValue(createdImage);

      const response = await request(httpServer)
        .post('/images')
        .field('title', '  Cat  ')
        .field('width', '1920')
        .field('height', '1080')
        .attach('file', uploadedBuffer, {
          filename: 'cat.png',
          contentType: 'image/png',
        })
        .expect(201);

      expect(createImageUseCaseMock.execute).toHaveBeenCalledTimes(1);

      const createArgument = createImageUseCaseMock.execute.mock.calls[0]?.[0];

      expect(createArgument).toBeDefined();

      expect(createArgument.title).toBe('Cat');
      expect(createArgument.width).toBe(1920);
      expect(createArgument.height).toBe(1080);
      expect(createArgument.fileBuffer.equals(uploadedBuffer)).toBe(true);
      expect(response.body).toEqual(serializeImage(createdImage));
    });

    it('returns a validation error when the file is missing', async () => {
      const response = await request(httpServer)
        .post('/images')
        .field('title', 'Cat')
        .field('width', '1920')
        .field('height', '1080')
        .expect(400);

      expect(createImageUseCaseMock.execute).not.toHaveBeenCalled();
      const responseBody = response.body as ErrorResponseBody;

      expect(responseBody.statusCode).toBe(400);
      expect(responseBody.code).toBe('bad_request');
      expect(responseBody.message).toContain('File is required');
    });

    it('returns application errors using the global exception filter', async () => {
      createImageUseCaseMock.execute.mockRejectedValue(
        new InvalidImageFileException('Uploaded file could not be normalized.'),
      );

      const response = await request(httpServer)
        .post('/images')
        .field('title', 'Cat')
        .field('width', '1920')
        .field('height', '1080')
        .attach('file', makeValidPngBuffer(), {
          filename: 'cat.png',
          contentType: 'image/png',
        })
        .expect(400);

      expect(response.body).toEqual({
        statusCode: 400,
        code: 'invalid_image_file',
        message: 'Uploaded file could not be normalized.',
      });
    });
  });

  describe('GET /images/:uuid', () => {
    it('returns the image when the uuid is valid and the resource exists', async () => {
      const image = makeImage();

      getImageUseCaseMock.execute.mockResolvedValue(image);

      const response = await request(httpServer)
        .get('/images/' + image.uuid)
        .expect(200);

      expect(getImageUseCaseMock.execute).toHaveBeenCalledWith({
        uuid: image.uuid,
      });
      expect(response.body).toEqual(serializeImage(image));
    });

    it('returns a validation error when the uuid is invalid', async () => {
      const response = await request(httpServer)
        .get('/images/not-a-uuid')
        .expect(400);

      expect(getImageUseCaseMock.execute).not.toHaveBeenCalled();
      const responseBody = response.body as ErrorResponseBody;

      expect(responseBody.statusCode).toBe(400);
      expect(responseBody.code).toBe('bad_request');
      expect(responseBody.message).toContain('uuid');
    });

    it('returns not_found when the use case raises an application exception', async () => {
      const missingUuid = '550e8400-e29b-41d4-a716-446655440001';

      getImageUseCaseMock.execute.mockRejectedValue(
        new ApplicationException(
          APPLICATION_ERROR_CODES.IMAGE_NOT_FOUND,
          `Image with uuid ${missingUuid} was not found`,
        ),
      );

      const response = await request(httpServer)
        .get('/images/' + missingUuid)
        .expect(404);

      const responseBody = response.body as ErrorResponseBody;

      expect(responseBody.statusCode).toBe(404);
      expect(responseBody.code).toBe('not_found');
      expect(responseBody.message).toBe(
        `Image with uuid ${missingUuid} was not found`,
      );
    });
  });

  describe('GET /images', () => {
    it('uses the DTO default pagination values when the query is omitted', async () => {
      const paginatedResult: PaginatedResult<ImageResult> = {
        items: [makeImage()],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      listImagesUseCaseMock.execute.mockResolvedValue(paginatedResult);

      const response = await request(httpServer).get('/images').expect(200);

      expect(listImagesUseCaseMock.execute).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
      expect(response.body).toEqual({
        items: paginatedResult.items.map((image) => serializeImage(image)),
        total: paginatedResult.total,
        page: paginatedResult.page,
        limit: paginatedResult.limit,
        totalPages: paginatedResult.totalPages,
      });
    });

    it('transforms query parameters before delegating to the use case', async () => {
      const paginatedResult: PaginatedResult<ImageResult> = {
        items: [makeImage()],
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
      };

      listImagesUseCaseMock.execute.mockResolvedValue(paginatedResult);

      await request(httpServer)
        .get('/images')
        .query({ page: '2', size: '5' })
        .expect(200);

      expect(listImagesUseCaseMock.execute).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
      });
    });

    it('returns a validation error when pagination is invalid', async () => {
      const response = await request(httpServer)
        .get('/images')
        .query({ page: '0', size: '101' })
        .expect(400);

      expect(listImagesUseCaseMock.execute).not.toHaveBeenCalled();
      const responseBody = response.body as ErrorResponseBody;

      expect(responseBody.statusCode).toBe(400);
      expect(responseBody.code).toBe('bad_request');
      expect(responseBody.message).toContain('page must not be less than 1');
      expect(responseBody.message).toContain(
        'size must not be greater than 100',
      );
    });
  });
});
