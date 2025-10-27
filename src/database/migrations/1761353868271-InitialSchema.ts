import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1761353868271 implements MigrationInterface {
    name = 'InitialSchema1761353868271'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "item" ("id" SERIAL NOT NULL, "sku" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "quantity" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_d3c0c71f23e7adcf952a1d13423" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_04b4bcce1bb7609fc226ce8c6c" ON "item" ("sku") `);
        await queryRunner.query(`CREATE TYPE "public"."inventory_log_type_enum" AS ENUM('IN', 'OUT', 'ADJUSMENT')`);
        await queryRunner.query(`CREATE TABLE "inventory_log" ("id" SERIAL NOT NULL, "type" "public"."inventory_log_type_enum" NOT NULL, "quantity_changed" integer NOT NULL, "reason" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "item_id" integer, "user_id" integer, CONSTRAINT "PK_92195bfa4eaa5c9e798021900f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`ALTER TABLE "inventory_log" ADD CONSTRAINT "FK_763e686ae2e70ec1739ac11b3db" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_log" ADD CONSTRAINT "FK_64e991d5f6a1b2c78179c55af12" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_log" DROP CONSTRAINT "FK_64e991d5f6a1b2c78179c55af12"`);
        await queryRunner.query(`ALTER TABLE "inventory_log" DROP CONSTRAINT "FK_763e686ae2e70ec1739ac11b3db"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "inventory_log"`);
        await queryRunner.query(`DROP TYPE "public"."inventory_log_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_04b4bcce1bb7609fc226ce8c6c"`);
        await queryRunner.query(`DROP TABLE "item"`);
    }

}
