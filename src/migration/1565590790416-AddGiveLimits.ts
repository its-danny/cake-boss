import {MigrationInterface, QueryRunner} from "typeorm";

export class AddGiveLimits1565590790416 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" ADD "giveLimit" integer NOT NULL DEFAULT 5`);
        await queryRunner.query(`ALTER TABLE "config" ADD "giveLimitHourReset" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "member" ADD "given" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "member" ADD "givenSinceReset" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "givenSinceReset"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "given"`);
        await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "giveLimitHourReset"`);
        await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "giveLimit"`);
    }

}
