import {MigrationInterface, QueryRunner} from "typeorm";

export class NicknameShouldNotBeNull1566066477005 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" ALTER COLUMN "nickname" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" ALTER COLUMN "nickname" DROP NOT NULL`);
    }

}
