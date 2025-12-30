import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Initial Clean Schema Migration
 * 
 * Creates the complete database structure following TypeORM best practices:
 * - All foreign keys properly defined with cascading
 * - Appropriate indexes for performance
 * - Clean field naming and constraints
 * - Optimized data types
 */
export class InitialCleanSchema1767087521861 implements MigrationInterface {
    name = 'InitialCleanSchema1767087521861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create teams table (independent entity)
        await queryRunner.query(`CREATE TABLE \`teams\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`description\` text NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
        // Create users table (depends on teams)
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(100) NOT NULL, \`name\` varchar(100) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('user', 'editor', 'admin') NOT NULL DEFAULT 'user', \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`teamId\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
        // Create questionnaires table (depends on users)
        await queryRunner.query(`CREATE TABLE \`questionnaires\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(200) NOT NULL, \`description\` text NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`createdById\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
        // Create questions table (depends on questionnaires)
        await queryRunner.query(`CREATE TABLE \`questions\` (\`id\` varchar(36) NOT NULL, \`text\` varchar(500) NOT NULL, \`type\` enum ('radio', 'checkbox', 'text', 'textarea', 'select', 'number', 'image', 'gps', 'gps_manual') NOT NULL, \`options\` json NULL, \`isRequired\` tinyint NOT NULL DEFAULT 0, \`order\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`questionnaireId\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
        // Create municipalities table (independent entity)
        await queryRunner.query(`CREATE TABLE \`municipalities\` (\`id\` varchar(36) NOT NULL, \`code\` varchar(20) NOT NULL, \`name\` varchar(100) NOT NULL, \`district\` varchar(100) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_9e0e960d7323bb120dc5e915dd\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
        // Create responses table (simplified structure with flexible JSON)
        await queryRunner.query(`CREATE TABLE \`responses\` (\`id\` varchar(36) NOT NULL, \`surveyId\` varchar(200) NOT NULL, \`answers\` json NOT NULL, \`metadata\` json NULL, \`status\` enum ('draft', 'final') NOT NULL DEFAULT 'draft', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(255) NOT NULL, \`municipalityId\` varchar(255) NULL, \`lastModifiedBy\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
        // Create files table (database storage with BLOB)
        await queryRunner.query(`CREATE TABLE \`files\` (\`id\` varchar(36) NOT NULL, \`fileName\` varchar(255) NOT NULL, \`mimeType\` varchar(100) NOT NULL, \`data\` longblob NOT NULL, \`size\` int UNSIGNED NOT NULL, \`uploadedBy\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
        // Add foreign key constraints (in dependency order)
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_d1803064187c8f38e57a9c4984c\` FOREIGN KEY (\`teamId\`) REFERENCES \`teams\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`questionnaires\` ADD CONSTRAINT \`FK_fe53d35d94ef27fa1c3cced85ee\` FOREIGN KEY (\`createdById\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD CONSTRAINT \`FK_a25e444b4f0c7e666a72b702880\` FOREIGN KEY (\`questionnaireId\`) REFERENCES \`questionnaires\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        
        console.log('✅ Initial clean schema created successfully');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first (reverse dependency order)
        await queryRunner.query(`ALTER TABLE \`questions\` DROP FOREIGN KEY \`FK_a25e444b4f0c7e666a72b702880\``);
        await queryRunner.query(`ALTER TABLE \`questionnaires\` DROP FOREIGN KEY \`FK_fe53d35d94ef27fa1c3cced85ee\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_d1803064187c8f38e57a9c4984c\``);
        
        // Drop tables in reverse dependency order
        await queryRunner.query(`DROP TABLE \`files\``);
        await queryRunner.query(`DROP INDEX \`IDX_9e0e960d7323bb120dc5e915dd\` ON \`municipalities\``);
        await queryRunner.query(`DROP TABLE \`municipalities\``);
        await queryRunner.query(`DROP TABLE \`responses\``);
        await queryRunner.query(`DROP TABLE \`questions\``);
        await queryRunner.query(`DROP TABLE \`questionnaires\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`teams\``);
        
        console.log('✅ Schema rollback completed');
    }
}
