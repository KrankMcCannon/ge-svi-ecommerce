import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { CustomException } from './custom-exception';
import { ErrorLevel } from './errors';

export class StandardResponse<T> {
  /**
   * Error code of the response
   * if 0, errorLevel must be OK
   * if > 0, errorLevel must be ERROR
   * Unique for each error type
   */
  @ApiProperty()
  errorCode: number;

  /**
   * Error level of the response
   */
  @ApiProperty()
  errorLevel: ErrorLevel;

  /**
   * Error description, in english
   */
  @ApiProperty()
  errorDescription: string;

  /**
   * Data of the response
   */
  @ApiProperty()
  data: T;

  constructor(
    data?: T,
    errorCode = 0,
    errorLevel = ErrorLevel.OK,
    errorDescription = 'OK',
  ) {
    this.errorCode = errorCode;
    this.errorLevel = errorLevel;
    this.errorDescription = errorDescription;
    if (data) {
      this.data = data;
    }
  }

  throw(ex?: CustomException): StandardResponse<T> {
    if (ex) {
      this.errorCode = ex.errorCode ?? 9999;
      this.errorLevel = ex.errorLevel ?? ErrorLevel.ERROR;
      this.errorDescription =
        ex.errorDescription || ex.message || ex.toString();
      this.data = ex.data;
    }
    return this;
  }

  static throw<T>(ex: CustomException): StandardResponse<T> {
    return new StandardResponse<T>().throw(ex);
  }
}

//swagger decorator
export const ApiStandardResponse = <TModel extends Type<any>>(options?: {
  description?: string;
  type?: TModel;
}) => {
  const allOf: (SchemaObject | ReferenceObject)[] = [
    { $ref: getSchemaPath(StandardResponse) },
  ];
  if (options?.type) {
    allOf.push({
      properties: {
        data: {
          $ref: getSchemaPath(options?.type),
        },
      },
    });
  }
  return applyDecorators(
    ApiOkResponse({
      description: options?.description,
      schema: {
        allOf,
      },
    }),
  );
};
