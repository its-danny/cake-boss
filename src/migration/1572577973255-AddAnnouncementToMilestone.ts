import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnnouncementToMilestone1572577973255 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "milestone" ADD "announcement" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "milestone" DROP COLUMN "announcement"`);
  }
}
