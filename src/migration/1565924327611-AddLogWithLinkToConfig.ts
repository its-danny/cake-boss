import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLogWithLinkToConfig1565924327611 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" ADD "logWithLink" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "logWithLink"`);
  }
}
