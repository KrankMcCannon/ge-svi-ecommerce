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
  E_0006_FORBIDDEN: new ErrorEnumValue(
    6,
    ErrorLevel.ERROR,
    'Forbidden',
    HttpStatus.FORBIDDEN,
  ),
  E_0007_SAVE_ERROR: new ErrorEnumValue(
    7,
    ErrorLevel.ERROR,
    'Error occurred while saving entity',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0008_BAD_REQUEST: new ErrorEnumValue(
    8,
    ErrorLevel.ERROR,
    'Bad Request',
    HttpStatus.BAD_REQUEST,
  ),

  // Product Errors
  E_0010_PRODUCT_CREATION_ERROR: new ErrorEnumValue(
    10,
    ErrorLevel.ERROR,
    'Error occurred while creating product',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0011_PRODUCT_UPDATE_ERROR: new ErrorEnumValue(
    11,
    ErrorLevel.ERROR,
    'Error occurred while updating product',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0012_PRODUCT_REMOVE_ERROR: new ErrorEnumValue(
    12,
    ErrorLevel.ERROR,
    'Error occurred while removing product',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0013_PRODUCT_NOT_FOUND: new ErrorEnumValue(
    13,
    ErrorLevel.ERROR,
    'Product not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0014_PRODUCT_SAVE_ERROR: new ErrorEnumValue(
    14,
    ErrorLevel.ERROR,
    'Error occurred while saving product',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0015_INSUFFICIENT_STOCK: new ErrorEnumValue(
    15,
    ErrorLevel.ERROR,
    'Insufficient stock for the product',
    HttpStatus.CONFLICT,
  ),
  E_0016_DUPLICATE_PRODUCT: new ErrorEnumValue(
    16,
    ErrorLevel.ERROR,
    'A product with this name already exists',
    HttpStatus.CONFLICT,
  ),

  // Cart Errors
  E_0020_CART_ADD_ERROR: new ErrorEnumValue(
    20,
    ErrorLevel.ERROR,
    'Error occurred while adding item to cart',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0021_CART_FETCH_ERROR: new ErrorEnumValue(
    21,
    ErrorLevel.ERROR,
    'Error occurred while fetching cart items',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0022_CART_REMOVE_ERROR: new ErrorEnumValue(
    22,
    ErrorLevel.ERROR,
    'Error occurred while removing item from cart',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0023_CART_SAVE_ERROR: new ErrorEnumValue(
    23,
    ErrorLevel.ERROR,
    'Error occurred while saving cart',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0024_CART_EMPTY: new ErrorEnumValue(
    24,
    ErrorLevel.ERROR,
    'The cart is empty',
    HttpStatus.BAD_REQUEST,
  ),
  E_0025_CART_NOT_FOUND: new ErrorEnumValue(
    25,
    ErrorLevel.ERROR,
    'Cart not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0026_CART_ITEM_ADD_ERROR: new ErrorEnumValue(
    26,
    ErrorLevel.ERROR,
    'Error occurred while adding item to cart',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0027_CART_ITEM_NOT_FOUND: new ErrorEnumValue(
    27,
    ErrorLevel.ERROR,
    'Cart item not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0028_CART_ITEM_SAVE_ERROR: new ErrorEnumValue(
    28,
    ErrorLevel.ERROR,
    'Error occurred while saving cart item',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),

  // Comment Errors
  E_0030_COMMENT_CREATION_ERROR: new ErrorEnumValue(
    30,
    ErrorLevel.ERROR,
    'Error occurred while creating comment',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0031_COMMENT_FETCH_ERROR: new ErrorEnumValue(
    31,
    ErrorLevel.ERROR,
    'Error occurred while fetching comments',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0032_COMMENT_NOT_FOUND: new ErrorEnumValue(
    32,
    ErrorLevel.ERROR,
    'Comment not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0033_INVALID_COMMENT: new ErrorEnumValue(
    33,
    ErrorLevel.ERROR,
    'Comment text is too short',
    HttpStatus.BAD_REQUEST,
  ),
  E_0034_COMMENT_DELETION_ERROR: new ErrorEnumValue(
    34,
    ErrorLevel.ERROR,
    'Error occurred while deleting comment',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  // User Errors
  E_0040_USER_CREATION_ERROR: new ErrorEnumValue(
    40,
    ErrorLevel.ERROR,
    'Error occurred while creating user',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0041_USER_UPDATE_ERROR: new ErrorEnumValue(
    41,
    ErrorLevel.ERROR,
    'Error occurred while updating user',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0042_USER_REMOVE_ERROR: new ErrorEnumValue(
    42,
    ErrorLevel.ERROR,
    'Error occurred while removing user',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0043_USER_NOT_FOUND: new ErrorEnumValue(
    43,
    ErrorLevel.ERROR,
    'User not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0044_DUPLICATE_USER: new ErrorEnumValue(
    44,
    ErrorLevel.ERROR,
    'A user with this email already exists',
    HttpStatus.CONFLICT,
  ),
  E_0045_INVALID_USER: new ErrorEnumValue(
    45,
    ErrorLevel.ERROR,
    'Invalid user data',
    HttpStatus.BAD_REQUEST,
  ),
  E_0046_USER_SAVE_ERROR: new ErrorEnumValue(
    46,
    ErrorLevel.ERROR,
    'Error occurred while saving user',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),

  // Order Errors
  E_0050_ORDER_CREATION_ERROR: new ErrorEnumValue(
    50,
    ErrorLevel.ERROR,
    'Error occurred while creating order',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0051_ORDER_NOT_FOUND_ERROR: new ErrorEnumValue(
    51,
    ErrorLevel.ERROR,
    'Order not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0052_ORDER_SAVE_ERROR: new ErrorEnumValue(
    52,
    ErrorLevel.ERROR,
    'Error occurred while saving order',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0053_ORDER_REMOVE_ERROR: new ErrorEnumValue(
    53,
    ErrorLevel.ERROR,
    'Error occurred while removing order',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0054_ORDER_ITEM_CREATION_ERROR: new ErrorEnumValue(
    54,
    ErrorLevel.ERROR,
    'Error occurred while creating order item',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0055_ORDER_ITEM_NOT_FOUND: new ErrorEnumValue(
    55,
    ErrorLevel.ERROR,
    'Order item not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0056_ORDER_ITEM_SAVE_ERROR: new ErrorEnumValue(
    56,
    ErrorLevel.ERROR,
    'Error occurred while saving order item',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0057_ORDER_ITEM_REMOVE_ERROR: new ErrorEnumValue(
    57,
    ErrorLevel.ERROR,
    'Error occurred while removing order item',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  // Order Errors
  E_0060_ORDER_CREATION_ERROR: new ErrorEnumValue(
    60,
    ErrorLevel.ERROR,
    'Error occurred while creating order',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),
  E_0061_ORDER_NOT_FOUND_ERROR: new ErrorEnumValue(
    61,
    ErrorLevel.ERROR,
    'Order not found',
    HttpStatus.NOT_FOUND,
  ),
  E_0062_ORDER_UPDATE_ERROR: new ErrorEnumValue(
    62,
    ErrorLevel.ERROR,
    'Error occurred while updating order',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  E_0063_ORDER_ITEM_CREATION_ERROR: new ErrorEnumValue(
    63,
    ErrorLevel.ERROR,
    'Error occurred while creating order item',
    HttpStatus.UNPROCESSABLE_ENTITY,
  ),

  // Internal Server Error
  E_9999_INTERNAL_SERVER_ERROR: new ErrorEnumValue(
    9999,
    ErrorLevel.ERROR,
    'Internal Server Error',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
};
