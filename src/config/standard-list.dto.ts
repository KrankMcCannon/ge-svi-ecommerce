import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { PaginationInfo } from './pagination-info.dto';
import { StandardResponse } from './standard-response.dto';

export class StandardList<T> {
  /**
   * Extracted data list
   */
  list: T[];

  /**
   * Total number of elements
   */
  @ApiProperty()
  totalElements: number;

  /**
   * If pagination is enabled
   */
  @ApiProperty()
  paged: boolean;

  /**
   * Selected page number
   */
  @ApiProperty()
  pageNumber: number;

  /**
   * Page size requested
   */
  @ApiProperty()
  pageSize: number;

  /**
   * Total number of pages
   */
  @ApiProperty()
  totalPages: number;

  /**
   * Number of elements
   */
  @ApiProperty()
  localElements: number;

  /**
   * If page has content
   */
  @ApiProperty()
  hasContent: boolean;

  /**
   * If the returned page is the first page
   */
  @ApiProperty()
  first: boolean;

  /**
   * If the returned page is the last page
   */
  @ApiProperty()
  last: boolean;

  /**
   * If there is a next page
   */
  @ApiProperty()
  hasNext: boolean;

  /**
   * If there is a previous page
   */
  @ApiProperty()
  hasPrevious: boolean;

  constructor(list: T[], count?: number, paginationInfo?: PaginationInfo) {
    this.localElements = list.length;
    this.list = list;
    this.hasContent = this.localElements > 0;

    if (count) {
      this.totalElements = count;
    }

    // elements taken from input
    if (paginationInfo) {
      this.paged = paginationInfo.paginationEnabled;
      this.pageNumber = paginationInfo.pageNumber;
      this.pageSize = paginationInfo.pageSize;
    } else {
      this.paged = false;
    }

    if (count && paginationInfo) {
      // total pages calculation
      // If paginated, calculate by dividing the total elements by the page size, rounding up
      // if not paginated, it will always be equal to 1
      this.totalPages = this.paged
        ? Math.ceil(this.totalElements / this.pageSize)
        : 1;

      // check if last page, based on current page number and total pages
      this.last = this.pageNumber === this.totalPages - 1;
      this.hasNext = !this.last;

      // check if first page, based on current page number
      this.first = this.pageNumber === 0;
      this.hasPrevious = !this.first;
    }
  }
}

//swagger decorator
export const ApiStandardList = <TModel extends Type<any>>(options: {
  type: TModel;
  description?: string;
}) =>
  applyDecorators(
    ApiOkResponse({
      description: options.description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardResponse) },
          {
            properties: {
              data: {
                allOf: [
                  { $ref: getSchemaPath(StandardList) },
                  {
                    properties: {
                      list: {
                        type: 'array',
                        items: { $ref: getSchemaPath(options.type) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  );
