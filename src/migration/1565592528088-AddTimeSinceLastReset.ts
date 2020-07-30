import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimeSinceLastReset1565592528088 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "server" ADD "timeSinceLastReset" integer NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "server" DROP COLUMN "timeSinceLastReset"`);
  }
}
