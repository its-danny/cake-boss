import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriceToPrize1565644818607 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "prize" ADD "price" integer NOT NULL DEFAULT 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "prize" DROP COLUMN "price"`);
  }
}
