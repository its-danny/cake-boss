import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommandPrefix1565593582230 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" ADD "commandPrefix" character varying NOT NULL DEFAULT '-'`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "commandPrefix"`);
  }
}
