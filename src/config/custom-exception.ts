import { HttpException, HttpStatus } from '@nestjs/common';
import { CustomLogger } from './custom-logger';
import { ErrorEnumValue, ErrorLevel } from './errors';

export class CustomException extends HttpException {
  errorCode: number;
  errorLevel: ErrorLevel;
  errorDescription: string;
  data: any;
  originalError?: Error;

  constructor(
    errorCode: number,
    errorLevel: ErrorLevel,
    errorDescription: string,
    status: number = HttpStatus.BAD_REQUEST,
    data?: any,
    originalError?: Error,
  ) {
    super({ errorCode, errorLevel, errorDescription, data }, status);
    this.errorCode = errorCode;
    this.errorLevel = errorLevel;
    this.errorDescription = errorDescription;
    this.data = data;
    this.originalError = originalError;

    if (originalError && originalError.stack) {
      this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
    }

    CustomLogger.error(
      `CustomException: ${errorDescription}`,
      originalError || data,
    );
  }

  static fromErrorEnum(
    errorEnumValue: ErrorEnumValue,
    options?: { data?: any; originalError?: Error },
  ): CustomException {
    return new CustomException(
      errorEnumValue.errorCode,
      errorEnumValue.errorLevel,
      errorEnumValue.errorDescription,
      errorEnumValue.errorStatus,
      options?.data,
      options?.originalError,
    );
  }

  static fromHttpException(ex: HttpException): CustomException {
    const status = ex.getStatus();
    const response = ex.getResponse() as {
      statusCode: number;
      message: string;
    };

    const errorDescription = response?.message || 'Unknown Error';
    const errorCode = response?.statusCode || 9999;
    const errorLevel = ErrorLevel.ERROR;

    return new CustomException(
      errorCode,
      errorLevel,
      errorDescription,
      status,
      undefined,
      ex,
    );
  }
}
