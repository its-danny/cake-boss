import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNoDropGifsToConfig1566406606309 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" ADD "noDropGifs" text NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "noDropGifs"`);
  }
}
