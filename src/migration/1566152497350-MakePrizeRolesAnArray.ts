import {MigrationInterface, QueryRunner} from "typeorm";

export class MakePrizeRolesAnArray1566152497350 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "prize" RENAME COLUMN "roleId" TO "roleIds"`);
        await queryRunner.query(`ALTER TABLE "prize" DROP COLUMN "roleIds"`);
        await queryRunner.query(`ALTER TABLE "prize" ADD "roleIds" text NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "prize" DROP COLUMN "roleIds"`);
        await queryRunner.query(`ALTER TABLE "prize" ADD "roleIds" character varying`);
        await queryRunner.query(`ALTER TABLE "prize" RENAME COLUMN "roleIds" TO "roleId"`);
    }

}
