import { Injectable, PipeTransform } from '@nestjs/common';
import { CustomException } from './custom-exception';
import { Errors } from './errors';
import { PaginationInfo } from './pagination-info.dto';

@Injectable()
export class PaginationInfoPipe implements PipeTransform {
  transform(value: any): PaginationInfo {
    const paginationEnabled = value.paginationEnabled === 'true';
    let pageNumber = 0;
    let pageSize = 20;

    if (paginationEnabled) {
      if (value.pageNumber && isNaN(Number(value.pageNumber))) {
        throw CustomException.fromErrorEnum(
          Errors.E_0001_GENERIC_ERROR,
          'Invalid pageNumber',
        );
      }
      if (value.pageSize && isNaN(Number(value.pageSize))) {
        throw CustomException.fromErrorEnum(
          Errors.E_0001_GENERIC_ERROR,
          'Invalid pageSize',
        );
      }
      pageNumber = Number(value.pageNumber) || 0;
      pageSize = Number(value.pageSize) || 20;
    }

    return new PaginationInfo({
      paginationEnabled,
      pageNumber,
      pageSize,
    });
  }
}
