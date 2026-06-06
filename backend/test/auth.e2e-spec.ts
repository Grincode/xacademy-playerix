import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Repository, In } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

// Guarantees unique emails across all tests within a single run
let emailCounter = 0;
function uniqueEmail(prefix = 'e2e'): string {
  emailCounter++;
  return `${prefix}-${Date.now()}-${emailCounter}@e2e.test`;
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<User>;
  const createdEmails: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await userRepository.delete({ email: In(createdEmails) });
    }
    await app.close();
  });

  // ---------------------------------------------------------------
  // 5.1 — Valid registration returns 201 + JWT with role='user'
  // ---------------------------------------------------------------
  describe('POST /auth/register — valid registration', () => {
    it('returns 201 with access_token that decodes to role=user', async () => {
      const email = uniqueEmail('valid');
      createdEmails.push(email);

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'test123456' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
      expect(res.body.access_token).toBeTruthy();

      // Decode JWT payload without verification
      const payload = JSON.parse(
        Buffer.from(
          res.body.access_token.split('.')[1],
          'base64url',
        ).toString(),
      );
      expect(payload).toHaveProperty('sub');
      expect(payload).toHaveProperty('email', email);
      expect(payload.role).toBe('user');
    });
  });

  // ---------------------------------------------------------------
  // 5.2 — Duplicate email returns 409
  // ---------------------------------------------------------------
  describe('POST /auth/register — duplicate email', () => {
    it('returns 409 when the same email is registered twice', async () => {
      const email = uniqueEmail('dup');
      createdEmails.push(email);

      // First registration succeeds
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'test123456' })
        .expect(201);

      // Second registration with same email → 409
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'test123456' })
        .expect(409);
    });
  });

  // ---------------------------------------------------------------
  // 5.3 — Invalid input returns 400
  // ---------------------------------------------------------------
  describe('POST /auth/register — invalid input', () => {
    it('returns 400 for malformed email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'test123456' })
        .expect(400);
    });

    it('returns 400 for password shorter than 6 characters', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: uniqueEmail('shortpw'), password: '12345' })
        .expect(400);
      // No cleanup needed — user was never created (400)
    });
  });

  // ---------------------------------------------------------------
  // 5.4 — Non-admin POST /players returns 403
  // ---------------------------------------------------------------
  describe('POST /players — non-admin user', () => {
    it('returns 403 when a non-admin JWT tries to create a player', async () => {
      const email = uniqueEmail('nonadmin');
      createdEmails.push(email);

      // Register as a regular user
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'test123456' })
        .expect(201);

      const token = registerRes.body.access_token;

      // Use that token to POST /players → forbidden
      await request(app.getHttpServer())
        .post('/players')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Player' })
        .expect(403);
    });
  });
});
