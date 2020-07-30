import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMilestones1572306580379 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "milestone" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "amount" integer NOT NULL DEFAULT 1, "roleIds" text NOT NULL DEFAULT '', "serverId" integer, CONSTRAINT "PK_f8372abce331f60ba7b33fe23a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "milestone" ADD CONSTRAINT "FK_0cd46c7f302dc511e321e2b880c" FOREIGN KEY ("serverId") REFERENCES "server"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "milestone" DROP CONSTRAINT "FK_0cd46c7f302dc511e321e2b880c"`);
    await queryRunner.query(`DROP TABLE "milestone"`);
  }
}
