import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReminderTimerToConfig1568592554667 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" ADD "redeemTimer" integer NOT NULL DEFAULT 10`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "redeemTimer"`);
  }
}
