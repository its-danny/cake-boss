import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreateUpdateFields1565634456746 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "config" ADD "updatedAt" TIMESTAMP DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "user" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "user" ADD "updatedAt" TIMESTAMP DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "member" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "member" ADD "updatedAt" TIMESTAMP DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "server" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "server" ADD "updatedAt" TIMESTAMP DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "drop" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "drop" ADD "updatedAt" TIMESTAMP DEFAULT now()`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "drop" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "drop" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "server" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "server" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "createdAt"`);
  }
}
