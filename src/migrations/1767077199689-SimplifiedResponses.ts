import { MigrationInterface, QueryRunner } from "typeorm";

export class SimplifiedResponses1767077199689 implements MigrationInterface {
    name = 'SimplifiedResponses1767077199689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`responses\` DROP FOREIGN KEY \`FK_a9814d310833f66dab2c24314d2\``);
        await queryRunner.query(`DROP INDEX \`IDX_FILES_RESPONSE_ID\` ON \`files\``);
        await queryRunner.query(`CREATE TABLE \`municipalities\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`district\` varchar(50) NULL, \`region\` varchar(100) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`responses\` DROP COLUMN \`finalizedAt\``);
        await queryRunner.query(`ALTER TABLE \`responses\` DROP COLUMN \`version\``);
        await queryRunner.query(`ALTER TABLE \`responses\` ADD \`municipalityId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`responses\` ADD \`lastModifiedBy\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`responses\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`responses\` ADD \`metadata\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`responses\` CHANGE \`status\` \`status\` enum ('draft', 'final') NOT NULL DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE \`teams\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`questionnaires\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`options\``);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`options\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`responseId\``);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`responseId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`mimeType\``);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`mimeType\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`files\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` CHANGE \`createdAt\` \`createdAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`mimeType\``);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`mimeType\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`responseId\``);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`responseId\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`options\``);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`options\` longtext CHARACTER SET "utf8mb4" COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`questionnaires\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`teams\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`responses\` CHANGE \`status\` \`status\` enum ('draft', 'final', 'synchronized') NOT NULL DEFAULT ''draft''`);
        await queryRunner.query(`ALTER TABLE \`responses\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`responses\` ADD \`metadata\` longtext CHARACTER SET "utf8mb4" COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`responses\` DROP COLUMN \`lastModifiedBy\``);
        await queryRunner.query(`ALTER TABLE \`responses\` DROP COLUMN \`municipalityId\``);
        await queryRunner.query(`ALTER TABLE \`responses\` ADD \`version\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`responses\` ADD \`finalizedAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP TABLE \`municipalities\``);
        await queryRunner.query(`CREATE INDEX \`IDX_FILES_RESPONSE_ID\` ON \`files\` (\`responseId\`)`);
        await queryRunner.query(`ALTER TABLE \`responses\` ADD CONSTRAINT \`FK_a9814d310833f66dab2c24314d2\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
