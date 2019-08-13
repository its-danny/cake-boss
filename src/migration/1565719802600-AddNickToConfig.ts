import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNickToConfig1565719802600 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" ADD "nickname" character varying DEFAULT 'CAKE BOSS!'`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "nickname"`);
    }

}
