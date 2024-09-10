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
    // add . on parent if exist
    parent = parent ? `${parent}.` : parent;
    // flat map the constraints/children list
    return errors.flatMap<string>((elem) => {
      if (elem.constraints) {
        // get list of constraints values
        const constraints = Object.values(elem.constraints);
        // map constraints, adding parent if present
        return parent
          ? constraints.map((constraint) => `${parent}${constraint}`)
          : constraints;
      } else {
        // recursive error find
        return ValidationException.decodeValidationErrors(
          elem.children,
          `${parent}${elem.property}`,
        );
      }
    });
  }
}
