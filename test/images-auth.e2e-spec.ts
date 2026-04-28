import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Server } from 'http';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { ApplicationExceptionFilter } from '../src/common/application-exception.filter';
import appConfig from '../src/config/app.config';
import { CreateImageUseCase } from '../src/images/application/ports/in/create-image.use-case';
import { DeleteImageUseCase } from '../src/images/application/ports/in/delete-image.use-case';
import { GetImageUseCase } from '../src/images/application/ports/in/get-image.use-case';
import { ListImagesUseCase } from '../src/images/application/ports/in/list-images.use-case';
import { ImagesController } from '../src/images/presentation/http/images.controller';

type ErrorResponseBody = {
  statusCode: number;
  code: string;
  message: string | string[];
};

describe('Images HTTP API authorization (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let previousApiKey: string | undefined;

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
    previousApiKey = process.env.IMAGES_API_KEY;
    process.env.IMAGES_API_KEY = 'test-images-api-key';

    const moduleFixture: TestingModule = await Test.createTestingModule({
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
        {
          provide: appConfig.KEY,
          useValue: {
            imagesApiKey: 'test-images-api-key',
          },
        },
      ],
    }).compile();

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
    if (previousApiKey === undefined) {
      delete process.env.IMAGES_API_KEY;
    } else {
      process.env.IMAGES_API_KEY = previousApiKey;
    }

    await app.close();
  });

  it('returns unauthorized when the API key header is missing', async () => {
    const response = await request(httpServer).get('/images').expect(401);
    const responseBody = response.body as ErrorResponseBody;

    expect(responseBody.statusCode).toBe(401);
    expect(responseBody.code).toBe('unauthorized');
    expect(responseBody.message).toBe('Missing x-api-key header.');
    expect(listImagesUseCaseMock.execute).not.toHaveBeenCalled();
  });

  it('returns unauthorized when the API key header is invalid', async () => {
    const response = await request(httpServer)
      .get('/images')
      .set('x-api-key', 'wrong-api-key')
      .expect(401);

    const responseBody = response.body as ErrorResponseBody;

    expect(responseBody.statusCode).toBe(401);
    expect(responseBody.code).toBe('unauthorized');
    expect(responseBody.message).toBe('Invalid API key.');
    expect(listImagesUseCaseMock.execute).not.toHaveBeenCalled();
  });

  it('allows access when the API key header is valid', async () => {
    listImagesUseCaseMock.execute.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    await request(httpServer)
      .get('/images')
      .set('x-api-key', 'test-images-api-key')
      .expect(200);

    expect(listImagesUseCaseMock.execute).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
  });
});
