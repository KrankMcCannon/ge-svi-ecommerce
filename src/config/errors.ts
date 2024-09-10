import { HttpStatus } from '@nestjs/common';

export enum ErrorLevel {
  OK = 'OK',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export class ErrorEnumValue {
  errorStatus: number; //take from @nestjs/common HttpStatus
  errorCode: number;
  errorLevel: ErrorLevel;
  errorDescription: string;

  constructor(
    errorCode: number,
    errorLevel: ErrorLevel,
    errorDescription: string,
    errorStatus: number = HttpStatus.BAD_REQUEST,
  ) {
    this.errorCode = errorCode;
    this.errorLevel = errorLevel;
    this.errorDescription = errorDescription;
    this.errorStatus = errorStatus;
  }
}

export class CustomError extends Error {
  errorCode: number;
  errorLevel: ErrorLevel;
  errorStatus: number;

  constructor(errorEnumValue: ErrorEnumValue) {
    super(errorEnumValue.errorDescription); // sets the message property of the Error
    this.errorCode = errorEnumValue.errorCode;
    this.errorLevel = errorEnumValue.errorLevel;
    this.errorStatus = errorEnumValue.errorStatus;
  }
}

export const Errors = {
  E_0000_OK: new ErrorEnumValue(0, ErrorLevel.OK, 'OK', HttpStatus.OK),
  E_0001_GENERIC_ERROR: new ErrorEnumValue(
    1,
    ErrorLevel.ERROR,
    'Internal Server Error',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0002_NOT_FOUND_ERROR: new ErrorEnumValue(
    2,
    ErrorLevel.ERROR,
    'Not Found',
    HttpStatus.NOT_FOUND,
  ),
  E_0003_NOT_AUTHORIZED: new ErrorEnumValue(
    3,
    ErrorLevel.ERROR,
    'Unauthorized',
    HttpStatus.UNAUTHORIZED,
  ),
  E_0004_VALIDATION_KO: new ErrorEnumValue(
    4,
    ErrorLevel.ERROR,
    'Validation Error',
  ),
  E_0005_INTEGRITY_ERROR: new ErrorEnumValue(
    5,
    ErrorLevel.ERROR,
    'System has detected an integrity error',
  ),
};
