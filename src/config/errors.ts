import { HttpStatus } from '@nestjs/common';

export enum ErrorLevel {
  OK = 'OK',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export class ErrorEnumValue {
  //take from @nestjs/common HttpStatus
  errorStatus: number;
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
    // sets the message property of the Error
    super(errorEnumValue.errorDescription);
    this.errorCode = errorEnumValue.errorCode;
    this.errorLevel = errorEnumValue.errorLevel;
    this.errorStatus = errorEnumValue.errorStatus;
  }
}

export const Errors = {
  // General
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

  // Product Errors
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
  E_0010_INSUFFICIENT_STOCK: new ErrorEnumValue(
    10,
    ErrorLevel.ERROR,
    'Insufficient stock for the product',
    HttpStatus.CONFLICT,
  ),
  E_0011_DUPLICATE_PRODUCT: new ErrorEnumValue(
    11,
    ErrorLevel.ERROR,
    'A product with this name already exists',
    HttpStatus.CONFLICT,
  ),

  // Cart Errors
  E_0012_CART_ADD_ERROR: new ErrorEnumValue(
    12,
    ErrorLevel.ERROR,
    'Error occurred while adding item to cart',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0013_CART_FETCH_ERROR: new ErrorEnumValue(
    13,
    ErrorLevel.ERROR,
    'Error occurred while fetching cart items',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0014_CART_REMOVE_ERROR: new ErrorEnumValue(
    14,
    ErrorLevel.ERROR,
    'Error occurred while removing item from cart',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0015_CART_ITEM_NOT_FOUND: new ErrorEnumValue(
    15,
    ErrorLevel.ERROR,
    'Cart item not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0016_CART_EMPTY: new ErrorEnumValue(
    16,
    ErrorLevel.ERROR,
    'The cart is empty',
    HttpStatus.BAD_REQUEST,
  ),

  // Comment Errors
  E_0017_COMMENT_CREATION_ERROR: new ErrorEnumValue(
    17,
    ErrorLevel.ERROR,
    'Error occurred while creating comment',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0018_COMMENT_FETCH_ERROR: new ErrorEnumValue(
    18,
    ErrorLevel.ERROR,
    'Error occurred while fetching comments',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0019_COMMENT_NOT_FOUND: new ErrorEnumValue(
    19,
    ErrorLevel.ERROR,
    'Comment not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0020_INVALID_COMMENT: new ErrorEnumValue(
    20,
    ErrorLevel.ERROR,
    'Comment text is too short',
    HttpStatus.BAD_REQUEST,
  ),
  E_0021_COMMENT_DELETION_ERROR: new ErrorEnumValue(
    21,
    ErrorLevel.ERROR,
    'Error occurred while deleting comment',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  // User Errors
  E_0022_USER_CREATION_ERROR: new ErrorEnumValue(
    22,
    ErrorLevel.ERROR,
    'Error occurred while creating user',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0023_USER_UPDATE_ERROR: new ErrorEnumValue(
    23,
    ErrorLevel.ERROR,
    'Error occurred while updating user',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0024_USER_REMOVE_ERROR: new ErrorEnumValue(
    24,
    ErrorLevel.ERROR,
    'Error occurred while removing user',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0025_USER_NOT_FOUND: new ErrorEnumValue(
    25,
    ErrorLevel.ERROR,
    'User not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0026_DUPLICATE_USER: new ErrorEnumValue(
    26,
    ErrorLevel.ERROR,
    'A user with this email already exists',
    HttpStatus.CONFLICT,
  ),
  E_0027_INVALID_USER: new ErrorEnumValue(
    27,
    ErrorLevel.ERROR,
    'Invalid user data',
    HttpStatus.BAD_REQUEST,
  ),

  // Order Errors
  E_0028_ORDER_CREATION_ERROR: new ErrorEnumValue(
    28,
    ErrorLevel.ERROR,
    'Error occurred while creating order',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0029_ORDER_NOT_FOUND_ERROR: new ErrorEnumValue(
    29,
    ErrorLevel.ERROR,
    'Order not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0030_ORDER_SAVE_ERROR: new ErrorEnumValue(
    30,
    ErrorLevel.ERROR,
    'Error occurred while saving order',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0031_ORDER_REMOVE_ERROR: new ErrorEnumValue(
    31,
    ErrorLevel.ERROR,
    'Error occurred while removing order',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0032_ORDER_ITEM_CREATION_ERROR: new ErrorEnumValue(
    32,
    ErrorLevel.ERROR,
    'Error occurred while creating order item',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0033_ORDER_ITEM_NOT_FOUND: new ErrorEnumValue(
    33,
    ErrorLevel.ERROR,
    'Order item not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0034_ORDER_ITEM_SAVE_ERROR: new ErrorEnumValue(
    34,
    ErrorLevel.ERROR,
    'Error occurred while saving order item',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0035_ORDER_ITEM_REMOVE_ERROR: new ErrorEnumValue(
    35,
    ErrorLevel.ERROR,
    'Error occurred while removing order item',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  // Internal Server Error
  E_9999_INTERNAL_SERVER_ERROR: new ErrorEnumValue(
    9999,
    ErrorLevel.ERROR,
    'Internal Server Error',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
};
