import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await usersService.findOneByEmail('admin@fifa.com');

  if (user) {
    user.passwordHash = hashedPassword;
    await usersService.save(user);
    console.log('Admin user updated (admin@fifa.com / admin123)');
  } else {
    await usersService.create({
      email: 'admin@fifa.com',
      passwordHash: hashedPassword,
      role: 'admin',
    });
    console.log('Admin user created (admin@fifa.com / admin123)');
  }

  await app.close();
}

bootstrap();
