import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDropperRoles1565630695206 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" ADD "dropperRoles" text NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "dropperRoles"`);
  }
}
