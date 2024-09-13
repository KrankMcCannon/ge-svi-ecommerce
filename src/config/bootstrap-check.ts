import { CustomException } from './custom-exception';
import { CustomLogger } from './custom-logger';
import { EnvironmentVariables } from './environment-variables';
import { Errors } from './errors';

export function bootstrapCheck(): void {
  checkEnvironmentVariablesPresence();
}

function checkEnvironmentVariablesPresence(): void {
  const requiredVariables = [
    'PORT',
    'IP',
    'DATABASE_PROTOCOL',
    'DATABASE_HOST',
    'DATABASE_PORT',
  ];

  const missingVariables = requiredVariables.filter(
    (key) =>
      EnvironmentVariables[key] === undefined ||
      EnvironmentVariables[key] === null,
  );

  if (missingVariables.length > 0) {
    const missingVarsString = missingVariables.join(', ');
    CustomLogger.error(
      `The following environment variables are missing: ${missingVarsString}`,
    );
    throw CustomException.fromErrorEnum(Errors.E_0005_INTEGRITY_ERROR, {
      missingVariables,
    });
  }
}
