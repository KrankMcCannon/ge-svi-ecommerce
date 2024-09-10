import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { StandardList } from './standard-list.dto';
import { StandardResponse } from './standard-response.dto';
import { EnvironmentVariables } from './environment-variables';

export function swaggerConfigurator(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle(EnvironmentVariables.SWAGGER_TITLE)
    .setDescription(EnvironmentVariables.SWAGGER_DESCRIPTION)
    .setVersion(EnvironmentVariables.SWAGGER_APP_VERSION)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [StandardResponse, StandardList],
  });
  SwaggerModule.setup('/swagger', app, document);
}
