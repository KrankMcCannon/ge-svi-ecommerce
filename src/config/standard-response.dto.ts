import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';
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
  errorCode: number = 0;

  /**
   * Error level of the response
   */
  @ApiProperty()
  errorLevel: ErrorLevel = ErrorLevel.OK;

  /**
   * Error description, in english
   */
  @ApiProperty()
  errorDescription: string = 'OK';

  /**
   * Data of the response
   */
  @ApiProperty()
  data?: T;

  constructor(data?: T) {
    this.data = data;
  }

  static fromError(ex: CustomException): StandardResponse<null> {
    const response = new StandardResponse<null>();
    response.errorCode = ex.errorCode || 9999;
    response.errorLevel = ex.errorLevel || ErrorLevel.ERROR;
    response.errorDescription =
      ex.errorDescription || ex.message || 'An error occurred';
    response.data = ex.data || null;
    return response;
  }
}

export const ApiStandardResponse = <TModel extends Type<any>>(options?: {
  description?: string;
  type?: TModel;
}) => {
  const schema: any = {
    allOf: [{ $ref: getSchemaPath(StandardResponse) }],
  };

  if (options?.type) {
    schema.allOf.push({
      properties: {
        data: { $ref: getSchemaPath(options.type) },
      },
    });
  }

  return applyDecorators(
    ApiOkResponse({
      description: options?.description || 'Standard response',
      schema,
    }),
  );
};
