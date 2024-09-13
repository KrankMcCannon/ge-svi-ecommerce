import { ValidationError } from '@nestjs/common';
import { CustomException } from './custom-exception';
import { Errors } from './errors';

export class ValidationException extends CustomException {
  constructor(errors: ValidationError[]) {
    const messages = ValidationException.flattenValidationErrors(errors);

    super(
      Errors.E_0004_VALIDATION_KO.errorCode,
      Errors.E_0004_VALIDATION_KO.errorLevel,
      Errors.E_0004_VALIDATION_KO.errorDescription,
      Errors.E_0004_VALIDATION_KO.errorStatus,
      messages,
    );
  }

  private static flattenValidationErrors(
    errors: ValidationError[],
    parentPath = '',
  ): string[] {
    const messages: string[] = [];

    for (const error of errors) {
      const propertyPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      if (error.constraints) {
        for (const constraint of Object.values(error.constraints)) {
          messages.push(`${propertyPath}: ${constraint}`);
        }
      }

      if (error.children && error.children.length > 0) {
        messages.push(
          ...ValidationException.flattenValidationErrors(
            error.children,
            propertyPath,
          ),
        );
      }
    }

    return messages;
  }
}
