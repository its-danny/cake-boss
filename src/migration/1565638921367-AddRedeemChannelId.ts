import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRedeemChannelId1565638921367 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" ADD "redeemChannelId" character varying NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "redeemChannelId"`);
  }
}
