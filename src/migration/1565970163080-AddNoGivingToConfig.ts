import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNoGivingToConfig1565970163080 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" ADD "noGiving" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "noGiving"`);
    }

}
