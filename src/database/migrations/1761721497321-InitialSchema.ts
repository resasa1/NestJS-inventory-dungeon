import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1761721497321 implements MigrationInterface {
    name = 'InitialSchema1761721497321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "player_inventory" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "itemId" integer, CONSTRAINT "PK_0567aba2cc988de4503bfa3c24c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "item" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TYPE "public"."inventory_log_type_enum" RENAME TO "inventory_log_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."inventory_log_type_enum" AS ENUM('IN', 'OUT', 'ADJUSTMENT')`);
        await queryRunner.query(`ALTER TABLE "inventory_log" ALTER COLUMN "type" TYPE "public"."inventory_log_type_enum" USING "type"::"text"::"public"."inventory_log_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."inventory_log_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "player_inventory" ADD CONSTRAINT "FK_c2a32fc7016e62456b147dbddf0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player_inventory" ADD CONSTRAINT "FK_6e63340381705273025be2f302a" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_inventory" DROP CONSTRAINT "FK_6e63340381705273025be2f302a"`);
        await queryRunner.query(`ALTER TABLE "player_inventory" DROP CONSTRAINT "FK_c2a32fc7016e62456b147dbddf0"`);
        await queryRunner.query(`CREATE TYPE "public"."inventory_log_type_enum_old" AS ENUM('IN', 'OUT', 'ADJUSMENT')`);
        await queryRunner.query(`ALTER TABLE "inventory_log" ALTER COLUMN "type" TYPE "public"."inventory_log_type_enum_old" USING "type"::"text"::"public"."inventory_log_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."inventory_log_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."inventory_log_type_enum_old" RENAME TO "inventory_log_type_enum"`);
        await queryRunner.query(`ALTER TABLE "item" ADD "quantity" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`DROP TABLE "player_inventory"`);
    }

}
