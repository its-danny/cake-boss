import {MigrationInterface, QueryRunner} from "typeorm";

export class AddQuietModeToConfig1565904640778 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" ADD "quietMode" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "quietMode"`);
    }

}
