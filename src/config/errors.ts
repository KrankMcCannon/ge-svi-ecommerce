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
    HttpStatus.BAD_REQUEST,
  ),
  E_0005_INTEGRITY_ERROR: new ErrorEnumValue(
    5,
    ErrorLevel.ERROR,
    'System has detected an integrity error',
    HttpStatus.CONFLICT,
  ),
  E_0006_PRODUCT_CREATION_ERROR: new ErrorEnumValue(
    6,
    ErrorLevel.ERROR,
    'Error occurred while creating product',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0007_PRODUCT_UPDATE_ERROR: new ErrorEnumValue(
    7,
    ErrorLevel.ERROR,
    'Error occurred while updating product',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0008_PRODUCT_REMOVE_ERROR: new ErrorEnumValue(
    8,
    ErrorLevel.ERROR,
    'Error occurred while removing product',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0009_PRODUCT_NOT_FOUND: new ErrorEnumValue(
    9,
    ErrorLevel.ERROR,
    'Product not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0010_CART_ADD_ERROR: new ErrorEnumValue(
    10,
    ErrorLevel.ERROR,
    'Error occurred while adding item to cart',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0011_CART_REMOVE_ERROR: new ErrorEnumValue(
    11,
    ErrorLevel.ERROR,
    'Error occurred while removing item from cart',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0012_CART_ITEM_NOT_FOUND: new ErrorEnumValue(
    12,
    ErrorLevel.ERROR,
    'Cart item not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0013_COMMENT_CREATION_ERROR: new ErrorEnumValue(
    13,
    ErrorLevel.ERROR,
    'Error occurred while creating comment',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0014_COMMENT_FETCH_ERROR: new ErrorEnumValue(
    14,
    ErrorLevel.ERROR,
    'Error occurred while fetching comments',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0015_COMMENT_NOT_FOUND: new ErrorEnumValue(
    15,
    ErrorLevel.ERROR,
    'Comment not found',
    HttpStatus.NOT_FOUND,
  ),
};
