import { HttpException, HttpStatus } from '@nestjs/common';
import { CustomLogger } from './custom-logger';
import { ErrorEnumValue, ErrorLevel } from './errors';

export class CustomException extends HttpException {
  errorCode: number;
  errorLevel: ErrorLevel;
  errorDescription: string;
  data: any;

  constructor(
    obj: Partial<CustomException>,
    status: number = HttpStatus.BAD_REQUEST,
  ) {
    super(obj, status);
    if (obj instanceof HttpException) {
      CustomLogger.error(
        `CustomException constructor called with an instance of HttpException as argument.
      We should use plain object, which respect the requested structural typing,
      to avoid problems rendering the json when returning error responses.`,
        obj,
      );
    }
  }

  static fromErrorEnum(
    errorEnumValue: ErrorEnumValue,
    data?: any,
  ): CustomException {
    const exceptionInfo = CustomException.getExceptionInfo(
      errorEnumValue,
      data,
    );
    return new CustomException(exceptionInfo.body, exceptionInfo.status);
  }

  static fromHttpException(ex: HttpException): CustomException {
    // Extract status and response from the HttpException
    const status = ex.getStatus();
    const response = ex.getResponse() as {
      statusCode: number;
      message: string;
    };

    // Determine error description, error code, and error level based on the response
    // Assuming the response might have a message property
    const errorDescription =
      typeof response === 'object' && response.message
        ? response.message
        : 'Unknown Error';
    const errorCode =
      typeof response === 'object' && response.statusCode
        ? response.statusCode
        : 9999; // Default error code
    const errorLevel = ErrorLevel.ERROR; // Assuming all HttpExceptions represent errors

    // Create a new ErrorEnumValue instance
    const errorEnumValue = new ErrorEnumValue(
      errorCode,
      errorLevel,
      errorDescription,
      status,
    );

    // Construct the CustomException using the errorEnumValue and status
    const exceptionInfo = CustomException.getExceptionInfo(errorEnumValue);
    return new CustomException(exceptionInfo.body, exceptionInfo.status);
  }

  protected static getExceptionInfo(
    errorEnumValue: ErrorEnumValue,
    data?: any,
  ): { body: Partial<CustomException>; status: number } {
    return {
      body: {
        errorCode: errorEnumValue.errorCode,
        errorLevel: errorEnumValue.errorLevel,
        errorDescription: errorEnumValue.errorDescription,
        data: data,
      },
      status: errorEnumValue.errorStatus,
    };
  }
}
