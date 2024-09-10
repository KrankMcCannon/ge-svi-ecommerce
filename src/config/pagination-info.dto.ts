import { IsBoolean, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { EnvironmentVariables } from './environment-variables';

interface PaginationInfoInput {
  paginationEnabled?: boolean | string;
  pageNumber?: number | string;
  pageSize?: number | string;
}

export class PaginationInfo {
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  @IsBoolean()
  readonly paginationEnabled: boolean = true;

  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @IsInt()
  readonly pageNumber: number = 0;

  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @IsInt()
  readonly pageSize: number = 0;

  private readonly _numSkip: number = 0;
  get numSkip(): number {
    return this._numSkip;
  }

  constructor(data: PaginationInfoInput) {
    if (data.paginationEnabled) {
      this.paginationEnabled = String(data.paginationEnabled) === 'true';
    }

    if (this.paginationEnabled) {
      // assign pageNumber if present, otherwise 0
      this.pageNumber = data.pageNumber ? Number(data.pageNumber) : 0;
      // assign pageSize if present, otherwise default from configuration file
      this.pageSize = data.pageSize
        ? Number(data.pageSize)
        : EnvironmentVariables.DEFAULT_PAGINATION_PAGE_SIZE;

      // calculate number of elements to skip, multiplying page size for page number
      this._numSkip = this.pageSize * this.pageNumber;
    }
  }
}
