import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDropGifsToConfig1566053518593 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" ADD "dropGifs" text NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "dropGifs"`);
    }

}
