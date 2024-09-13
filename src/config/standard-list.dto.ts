import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { PaginationInfo } from './pagination-info.dto';

export class StandardList<T> {
  /**
   * Extracted data list
   */
  @ApiProperty()
  list: T[];

  /**
   * Total number of elements
   */
  @ApiProperty()
  totalElements: number = 0;

  /**
   * If pagination is enabled
   */
  @ApiProperty()
  paged: boolean = false;

  /**
   * Selected page number
   */
  @ApiProperty()
  pageNumber: number = 0;

  /**
   * Page size requested
   */
  @ApiProperty()
  pageSize: number = 0;

  /**
   * Total number of pages
   */
  @ApiProperty()
  totalPages: number = 1;

  /**
   * Number of elements
   */
  @ApiProperty()
  localElements: number = 0;

  /**
   * If page has content
   */
  @ApiProperty()
  hasContent: boolean = false;

  /**
   * If the returned page is the first page
   */
  @ApiProperty()
  first: boolean = true;

  /**
   * If the returned page is the last page
   */
  @ApiProperty()
  last: boolean = true;

  /**
   * If there is a next page
   */
  @ApiProperty()
  hasNext: boolean = false;

  /**
   * If there is a previous page
   */
  @ApiProperty()
  hasPrevious: boolean = false;

  constructor(list: T[], count = 0, paginationInfo?: PaginationInfo) {
    this.list = list || [];
    this.localElements = this.list.length;
    this.hasContent = this.localElements > 0;
    this.totalElements = count || this.localElements;

    if (paginationInfo) {
      this.paged = paginationInfo.paginationEnabled;
      this.pageNumber = paginationInfo.pageNumber;
      this.pageSize = paginationInfo.pageSize;

      if (this.paged && this.pageSize > 0) {
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        this.first = this.pageNumber === 0;
        this.last = this.pageNumber >= this.totalPages - 1;
        this.hasNext = !this.last;
        this.hasPrevious = !this.first;
      }
    } else {
      this.totalPages = 1;
    }
  }
}

export const ApiStandardList = <TModel extends Type<any>>(options?: {
  description?: string;
  type?: TModel;
}) => {
  return applyDecorators(
    ApiOkResponse({
      description: options?.description || 'Standard paginated list response',
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardList) },
          {
            properties: {
              list: {
                type: 'array',
                items: { $ref: getSchemaPath(options?.type) },
              },
            },
          },
        ],
      },
    }),
  );
};
