import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleIdToPrize1565654526049 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "prize" ADD "roleId" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "prize" DROP COLUMN "roleId"`);
  }
}
