import { Injectable } from '@nestjs/common';
import { CustomException } from '../config/custom-exception';
import { Errors } from '../config/errors';

@Injectable()
export class ValidationService {
  validate<T>(
    dto: Partial<T>,
    rules: Record<keyof T, (value: any) => boolean>,
  ): void {
    for (const [key, value] of Object.entries(dto)) {
      if (rules[key as keyof T] && !rules[key as keyof T](value)) {
        throw CustomException.fromErrorEnum(Errors.E_0004_VALIDATION_KO, {
          errorDescription: `Invalid or missing product ${key}.`,
        });
      }
    }
  }
}
