import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Bahia Escondida API')
    .setDescription(
      'REST API for Bahia Escondida backend. Authenticated routes require a Bearer JWT. ' +
        'The clientId is taken from the token — do not send it in request bodies for tenant-scoped resources.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token from POST /auth/login or POST /auth/register',
      },
      'bearer',
    )
    .addTag('auth', 'Registration, login, and session')
    .addTag('clients', 'Business tenant management')
    .addTag('products', 'Menu products and options')
    .addTag('sales', 'Orders / tabs')
    .addTag('payments', 'Sale payments')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  return document;
}
