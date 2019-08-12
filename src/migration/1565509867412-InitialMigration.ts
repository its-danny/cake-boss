import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1565509867412 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "config" ("id" SERIAL NOT NULL, "logChannelId" character varying NOT NULL DEFAULT '', "cakeEmoji" character varying NOT NULL DEFAULT '🍰', "cakeNameSingular" character varying NOT NULL DEFAULT 'cake', "cakeNamePlural" character varying NOT NULL DEFAULT 'cakes', "managerRoles" text NOT NULL DEFAULT '', "blesserRoles" text NOT NULL DEFAULT '', CONSTRAINT "PK_d0ee79a681413d50b0a4f98cf7b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "discordId" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "server" ("id" SERIAL NOT NULL, "discordId" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "configId" integer, CONSTRAINT "REL_eb12da9e4eb624e110dad91337" UNIQUE ("configId"), CONSTRAINT "PK_f8b8af38bdc23b447c0a57c7937" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "member" ("id" SERIAL NOT NULL, "discordId" character varying NOT NULL, "balance" integer NOT NULL DEFAULT 0, "earned" integer NOT NULL DEFAULT 0, "userId" integer, "serverId" integer, CONSTRAINT "PK_97cbbe986ce9d14ca5894fdc072" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "server" ADD CONSTRAINT "FK_eb12da9e4eb624e110dad913371" FOREIGN KEY ("configId") REFERENCES "config"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member" ADD CONSTRAINT "FK_08897b166dee565859b7fb2fcc8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member" ADD CONSTRAINT "FK_6d35cd40d0943e45d32abdf3adb" FOREIGN KEY ("serverId") REFERENCES "server"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "member" DROP CONSTRAINT "FK_6d35cd40d0943e45d32abdf3adb"`);
        await queryRunner.query(`ALTER TABLE "member" DROP CONSTRAINT "FK_08897b166dee565859b7fb2fcc8"`);
        await queryRunner.query(`ALTER TABLE "server" DROP CONSTRAINT "FK_eb12da9e4eb624e110dad913371"`);
        await queryRunner.query(`DROP TABLE "member"`);
        await queryRunner.query(`DROP TABLE "server"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "config"`);
    }

}
