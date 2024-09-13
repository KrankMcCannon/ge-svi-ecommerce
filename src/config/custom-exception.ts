import { HttpException, HttpStatus } from '@nestjs/common';
import { CustomLogger } from './custom-logger';
import { ErrorEnumValue, ErrorLevel } from './errors';

export class CustomException extends HttpException {
  errorCode: number;
  errorLevel: ErrorLevel;
  errorDescription: string;
  data: any;

  constructor(
    errorCode: number,
    errorLevel: ErrorLevel,
    errorDescription: string,
    status: number = HttpStatus.BAD_REQUEST,
    data?: any,
  ) {
    super({ errorCode, errorLevel, errorDescription, data }, status);
    this.errorCode = errorCode;
    this.errorLevel = errorLevel;
    this.errorDescription = errorDescription;
    this.data = data;

    CustomLogger.error(`CustomException: ${errorDescription}`, data);
  }

  static fromErrorEnum(
    errorEnumValue: ErrorEnumValue,
    data?: any,
  ): CustomException {
    return new CustomException(
      errorEnumValue.errorCode,
      errorEnumValue.errorLevel,
      errorEnumValue.errorDescription,
      errorEnumValue.errorStatus,
      data,
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

    return new CustomException(errorCode, errorLevel, errorDescription, status);
  }
}
