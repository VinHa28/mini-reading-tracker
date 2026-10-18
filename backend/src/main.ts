import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN')?.split(',') ?? true,
  });

  // Tắt bằng SWAGGER_ENABLED=false nếu không muốn công khai tài liệu API.
  if (config.get<string>('SWAGGER_ENABLED') !== 'false') {
    const swagger = new DocumentBuilder()
      .setTitle('Mini Reading Tracker API')
      .setDescription(
        'Quản lý tủ sách cá nhân. Dữ liệu sách lấy từ Open Library, tủ sách lưu trong MySQL.',
      )
      .setVersion('1.0')
      .build();
    SwaggerModule.setup(
      'api/docs',
      app,
      SwaggerModule.createDocument(app, swagger),
    );
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
