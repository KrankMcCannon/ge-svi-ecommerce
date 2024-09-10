import { CustomException } from './custom-exception';
import { CustomLogger } from './custom-logger';
import { EnvironmentVariables } from './environment-variables';
import { Errors } from './errors';

export function bootstrapCheck(): void {
  checkEnvironmentVariablesPresence();
}

function checkEnvironmentVariablesPresence(): void {
  //required environment variables list
  const requiredVariables = [
    'PORT',
    'IP',
    'DATABASE_PROTOCOL',
    'DATABASE_HOST',
    'DATABASE_PORT',
  ];

  //get every element that is missing
  const missingVariables = requiredVariables.filter(
    (elem) => !EnvironmentVariables[elem],
  );
  if (missingVariables.length > 0) {
    CustomLogger.error(
      'The following environment variables are missing:',
      missingVariables.join(', '),
    );
    throw CustomException.fromErrorEnum(
      Errors.E_0005_INTEGRITY_ERROR,
      missingVariables,
    );
  }
}
