import { MigrationInterface, QueryRunner } from "typeorm";

export class AddServerDrops1565629587774 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "drop" ("id" SERIAL NOT NULL, "channelDiscordId" character varying NOT NULL, "amount" integer NOT NULL DEFAULT 0, "serverId" integer, CONSTRAINT "PK_abaebd56a1515ba3b3f47c602fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "drop" ADD CONSTRAINT "FK_dcc9c3d7700ed5cda90a7cb9ff0" FOREIGN KEY ("serverId") REFERENCES "server"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "drop" DROP CONSTRAINT "FK_dcc9c3d7700ed5cda90a7cb9ff0"`);
    await queryRunner.query(`DROP TABLE "drop"`);
  }
}
