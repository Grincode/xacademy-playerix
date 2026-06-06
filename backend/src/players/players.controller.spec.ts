import { UseGuards } from '@nestjs/common';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PlayersController } from './players.controller';

describe('PlayersController', () => {
  describe('guards and roles metadata', () => {
    it('should have JwtAuthGuard and RolesGuard at class level', () => {
      const guards = Reflect.getMetadata('__guards__', PlayersController);

      expect(guards).toBeDefined();
      expect(guards).toHaveLength(2);
      expect(guards[0]).toBe(JwtAuthGuard);
      expect(guards[1]).toBe(RolesGuard);
    });

    const writeEndpoints = [
      { name: 'create', method: 'create' },
      { name: 'update', method: 'update' },
      { name: 'updateSkills', method: 'updateSkills' },
      { name: 'importCsv', method: 'importCsv' },
    ];

    const readEndpoints = [
      { name: 'findAll', method: 'findAll' },
      { name: 'findOne', method: 'findOne' },
      { name: 'getSkillTimeline', method: 'getSkillTimeline' },
    ];

    writeEndpoints.forEach(({ name, method }) => {
      it(`should have @Roles('admin') on ${name}()`, () => {
        const roles = Reflect.getMetadata(
          ROLES_KEY,
          PlayersController.prototype[method],
        );

        expect(roles).toBeDefined();
        expect(roles).toEqual(['admin']);
      });
    });

    readEndpoints.forEach(({ name, method }) => {
      it(`should NOT have @Roles on ${name}()`, () => {
        const roles = Reflect.getMetadata(
          ROLES_KEY,
          PlayersController.prototype[method],
        );

        expect(roles).toBeUndefined();
      });
    });
  });
});
