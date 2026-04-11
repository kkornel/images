import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

import { ApplicationException } from '@/common/application.exception';

type ErrorResponseBody = {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
};

const APPLICATION_ERROR_STATUS_CODES: Readonly<Record<string, number>> = {
  invalid_image_file: HttpStatus.BAD_REQUEST,
  image_storage_error: HttpStatus.SERVICE_UNAVAILABLE,
};

@Catch()
export class ApplicationExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    if (exception instanceof ApplicationException) {
      const statusCode = this.resolveApplicationStatusCode(exception.code);
      const body: ErrorResponseBody = {
        statusCode,
        code: exception.code,
        message: exception.message,
      };

      if (exception.details !== undefined) {
        body.details = exception.details;
      }

      response.status(statusCode).json(body);
      return;
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const body: ErrorResponseBody = {
        statusCode,
        code: this.resolveHttpExceptionCode(statusCode),
        message: this.extractHttpExceptionMessage(exceptionResponse),
      };

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        body.details = exceptionResponse;
      }

      response.status(statusCode).json(body);
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'internal_server_error',
      message: 'An unexpected error occurred.',
    } satisfies ErrorResponseBody);
  }

  private resolveApplicationStatusCode(code: string): number {
    return (
      APPLICATION_ERROR_STATUS_CODES[code] ?? HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  private extractHttpExceptionMessage(exceptionResponse: unknown): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (this.hasMessageProperty(exceptionResponse)) {
      if (Array.isArray(exceptionResponse.message)) {
        return exceptionResponse.message.join(', ');
      }

      if (typeof exceptionResponse.message === 'string') {
        return exceptionResponse.message;
      }
    }

    return 'Request validation failed.';
  }

  private hasMessageProperty(
    value: unknown,
  ): value is Readonly<{ message: unknown }> {
    return typeof value === 'object' && value !== null && 'message' in value;
  }

  private resolveHttpExceptionCode(statusCode: number): string {
    const statusToCode: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'bad_request',
      [HttpStatus.UNAUTHORIZED]: 'unauthorized',
      [HttpStatus.FORBIDDEN]: 'forbidden',
      [HttpStatus.NOT_FOUND]: 'not_found',
      [HttpStatus.CONFLICT]: 'conflict',
      [HttpStatus.PAYLOAD_TOO_LARGE]: 'payload_too_large',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'unprocessable_entity',
    };

    return statusToCode[statusCode] ?? 'http_exception';
  }
}
