import {MigrationInterface, QueryRunner} from "typeorm";

export class RenameRolesToRoleIds1565662143690 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "managerRoles"`);
        await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "blesserRoles"`);
        await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "dropperRoles"`);
        await queryRunner.query(`ALTER TABLE "config" ADD "managerRoleIds" text NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "config" ADD "blesserRoleIds" text NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "config" ADD "dropperRoleIds" text NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "dropperRoleIds"`);
        await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "blesserRoleIds"`);
        await queryRunner.query(`ALTER TABLE "config" DROP COLUMN "managerRoleIds"`);
        await queryRunner.query(`ALTER TABLE "config" ADD "dropperRoles" text NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "config" ADD "blesserRoles" text NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "config" ADD "managerRoles" text NOT NULL DEFAULT ''`);
    }

}
