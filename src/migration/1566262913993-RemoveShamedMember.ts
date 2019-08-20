import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveShamedMember1566262913993 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "member" ADD "shamed" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "shamed_member" DROP CONSTRAINT "FK_85eb5a349a1421a4dd42c1a39b2"`);
        await queryRunner.query(`ALTER TABLE "shamed_member" DROP CONSTRAINT "FK_f7d4a5ba63562c18692a27cb752"`);
        await queryRunner.query(`DROP TABLE "shamed_member"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "shamed_member" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "memberId" integer, "serverId" integer, CONSTRAINT "PK_789d0364c26be002176facec387" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "shamed_member" ADD CONSTRAINT "FK_f7d4a5ba63562c18692a27cb752" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shamed_member" ADD CONSTRAINT "FK_85eb5a349a1421a4dd42c1a39b2" FOREIGN KEY ("serverId") REFERENCES "server"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "shamed"`);
    }

}
