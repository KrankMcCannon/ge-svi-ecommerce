import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PaginationInfo } from './pagination-info.dto';

@Injectable()
export class PaginationInfoPipe implements PipeTransform {
  transform(value: any): PaginationInfo {
    // Ensure value is an object
    if (!value || typeof value !== 'object') {
      value = {};
    }

    // Transform plain object to PaginationInfo instance
    const paginationInfo = plainToInstance(PaginationInfo, value);

    // Validate the instance
    const errors = validateSync(paginationInfo, { whitelist: true });
    if (errors.length > 0) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    return paginationInfo;
  }
}
