import { MigrationInterface } from 'typeorm';
import { MongoQueryRunner } from 'typeorm/driver/mongodb/MongoQueryRunner';
import * as bcrypt from 'bcryptjs';
import { Role } from 'src/users/entities/role.enum';

export class AddAdminMigration20200709000000 implements MigrationInterface {
  public async up(queryRunner: MongoQueryRunner): Promise<any> {
    const count = await queryRunner.cursor('User', {}).count(false);
    if (count > 0) {
      return;
    }
    console.log(
      await queryRunner.insertOne('User', {
        name: 'Administrator',
        username: 'admin',
        email: 'admin@fgpe-gs.com',
        password: await bcrypt.hash('4dm1nS.', 10),
        roles: [Role.ADMIN],
        active: true,
      }),
    );
  }

  public async down(queryRunner: MongoQueryRunner): Promise<any> {
    await queryRunner.deleteOne('User', { username: 'admin' });
  }
}
