import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('FIFA Player Manager API')
    .setDescription('API para gestionar jugadores de FIFA')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Seed user login
  const usersService = app.get(UsersService);
  const adminEmail = 'admin@fifa.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await usersService.findOneByEmail(adminEmail);

  if (!adminUser) {
    await usersService.create({
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'admin',
    });
    console.log('Seed: Admin user created (admin@fifa.com / admin123)');
  } else {
    adminUser.passwordHash = hashedPassword;
    await usersService.create(adminUser);
    console.log('Seed: Admin user updated');
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
