import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRequirementToGiveConfig1565586930940 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" ADD "requirementToGive" integer NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "requirementToGive"`);
  }
}
