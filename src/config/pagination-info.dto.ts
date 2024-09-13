import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, Min } from 'class-validator';
import { EnvironmentVariables } from './environment-variables';

interface PaginationInfoInput {
  paginationEnabled?: boolean | string;
  pageNumber?: number | string;
  pageSize?: number | string;
}

export class PaginationInfo {
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return true;
  })
  @IsBoolean()
  paginationEnabled: boolean = true;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  pageNumber: number = 0;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  pageSize: number = EnvironmentVariables.DEFAULT_PAGINATION_PAGE_SIZE || 20;

  private _numSkip: number = 0;
  get numSkip(): number {
    return this._numSkip;
  }

  constructor(data?: PaginationInfoInput) {
    if (data) {
      if (data.paginationEnabled !== undefined) {
        this.paginationEnabled = String(data.paginationEnabled) === 'true';
      }

      if (this.paginationEnabled) {
        this.pageNumber = data.pageNumber ? Number(data.pageNumber) : 0;
        this.pageSize = data.pageSize
          ? Number(data.pageSize)
          : EnvironmentVariables.DEFAULT_PAGINATION_PAGE_SIZE || 20;
      } else {
        // If pagination is disabled, set defaults
        this.pageNumber = 0;
        this.pageSize = 0;
      }
    } else {
      // If data is undefined, use default values
      this.paginationEnabled = true;
      this.pageNumber = 0;
      this.pageSize = EnvironmentVariables.DEFAULT_PAGINATION_PAGE_SIZE || 20;
    }

    // Calculate number of elements to skip
    this._numSkip = this.pageSize * this.pageNumber;
  }
}
