import { ValidationError } from '@nestjs/common';
import { CustomException } from './custom-exception';
import { Errors } from './errors';

export class ValidationException extends CustomException {
  constructor(errors: ValidationError[]) {
    const exceptionInfo = CustomException.getExceptionInfo(
      Errors.E_0004_VALIDATION_KO,
      ValidationException.decodeValidationErrors(errors),
    );
    super(exceptionInfo.body, exceptionInfo.status);
  }

  private static decodeValidationErrors(
    errors: ValidationError[],
    parent = '',
  ): string[] {
    parent = parent ? `${parent}.` : parent;
    return errors.flatMap<string>((elem) => {
      if (elem.constraints) {
        const constraints = Object.values(elem.constraints);
        return parent
          ? constraints.map((constraint) => `${parent}${constraint}`)
          : constraints;
      } else {
        return ValidationException.decodeValidationErrors(
          elem.children,
          `${parent}${elem.property}`,
        );
      }
    });
  }
}
