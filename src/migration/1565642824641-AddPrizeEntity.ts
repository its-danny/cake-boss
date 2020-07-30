import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPrizeEntity1565642824641 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "prize" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "description" character varying NOT NULL DEFAULT '', "reactionEmoji" character varying NOT NULL DEFAULT '', "serverId" integer, CONSTRAINT "PK_ed6e4960a2fb62a3fa2025074fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ADD CONSTRAINT "FK_607429167548a2f6aee0694e48d" FOREIGN KEY ("serverId") REFERENCES "server"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "prize" DROP CONSTRAINT "FK_607429167548a2f6aee0694e48d"`);
    await queryRunner.query(`DROP TABLE "prize"`);
  }
}
