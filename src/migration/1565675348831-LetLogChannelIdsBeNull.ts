import {MigrationInterface, QueryRunner} from "typeorm";

export class LetLogChannelIdsBeNull1565675348831 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" ALTER COLUMN "logChannelId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "config" ALTER COLUMN "logChannelId" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "config" ALTER COLUMN "redeemChannelId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "config" ALTER COLUMN "redeemChannelId" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" ALTER COLUMN "redeemChannelId" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "config" ALTER COLUMN "redeemChannelId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "config" ALTER COLUMN "logChannelId" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "config" ALTER COLUMN "logChannelId" SET NOT NULL`);
    }

}
