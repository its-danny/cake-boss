import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMilestoneChannelConfig1572576788518 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" ADD "milestoneChannelId" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "milestoneChannelId"`);
  }
}
