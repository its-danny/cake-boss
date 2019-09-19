import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRedeemPingRoleIds1568861945888 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" ADD "redeemPingRoleIds" text NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "redeemPingRoleIds"`);
  }
}
