import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFileEntityFilesystem1767088031423 implements MigrationInterface {
    name = 'UpdateFileEntityFilesystem1767088031423'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`fileName\``);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`data\``);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`size\``);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`uploadedBy\``);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`responseId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`filename\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`fileSize\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`teams\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`responses\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`responses\` ADD \`metadata\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`responses\` CHANGE \`municipalityId\` \`municipalityId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`options\``);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`options\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`questionnaires\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`mimeType\``);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`mimeType\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`mimeType\``);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`mimeType\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`questionnaires\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`options\``);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`options\` longtext CHARACTER SET "utf8mb4" COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`responses\` CHANGE \`municipalityId\` \`municipalityId\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`responses\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`responses\` ADD \`metadata\` longtext CHARACTER SET "utf8mb4" COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`teams\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`fileSize\``);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`filename\``);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`responseId\``);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`uploadedBy\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`size\` int UNSIGNED NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`data\` longblob NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`fileName\` varchar(255) NOT NULL`);
    }

}
