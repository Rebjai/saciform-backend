import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeamManagementSupport1767603216273 implements MigrationInterface {
    name = 'AddTeamManagementSupport1767603216273'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teams\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`responses\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`responses\` ADD \`metadata\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`responses\` CHANGE \`municipalityId\` \`municipalityId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_d1803064187c8f38e57a9c4984c\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`teamId\` \`teamId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`options\``);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`options\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`questionnaires\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_d1803064187c8f38e57a9c4984c\` FOREIGN KEY (\`teamId\`) REFERENCES \`teams\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_d1803064187c8f38e57a9c4984c\``);
        await queryRunner.query(`ALTER TABLE \`questionnaires\` CHANGE \`description\` \`description\` text NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`options\``);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`options\` longtext CHARACTER SET "utf8mb4" COLLATE "utf8mb4_bin" NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`teamId\` \`teamId\` varchar(255) NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_d1803064187c8f38e57a9c4984c\` FOREIGN KEY (\`teamId\`) REFERENCES \`teams\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`responses\` CHANGE \`municipalityId\` \`municipalityId\` varchar(255) NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`responses\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`responses\` ADD \`metadata\` longtext CHARACTER SET "utf8mb4" COLLATE "utf8mb4_bin" NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`teams\` CHANGE \`description\` \`description\` text NULL DEFAULT ''NULL''`);
    }

}
