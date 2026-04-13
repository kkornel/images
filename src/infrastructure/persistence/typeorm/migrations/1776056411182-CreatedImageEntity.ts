import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedImageEntity1776056411182 implements MigrationInterface {
  name = 'CreatedImageEntity1776056411182';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "images" ("uuid" uuid NOT NULL, "title" character varying(255) NOT NULL, "storageKey" character varying(255) NOT NULL, "mimeType" character varying(100) NOT NULL, "extension" character varying(10) NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "size" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a5bd7999989d2a6bb88924613ba" PRIMARY KEY ("uuid"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "images"`);
  }
}
