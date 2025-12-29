import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1766988764647 implements MigrationInterface {
    name = 'InitialSchema1766988764647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teams\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`options\``);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`options\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`questionnaires\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`responses\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`responses\` ADD \`metadata\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`responses\` CHANGE \`finalizedAt\` \`finalizedAt\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`responses\` CHANGE \`finalizedAt\` \`finalizedAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`responses\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`responses\` ADD \`metadata\` longtext CHARACTER SET "utf8mb4" COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`questionnaires\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`options\``);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`options\` longtext CHARACTER SET "utf8mb4" COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`teams\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
    }

}
