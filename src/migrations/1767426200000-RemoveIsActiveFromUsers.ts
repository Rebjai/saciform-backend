import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIsActiveFromUsers1767426200000 implements MigrationInterface {
    name = 'RemoveIsActiveFromUsers1767426200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Solo remover la columna isActive de la tabla users
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isActive\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restaurar la columna isActive en caso de rollback
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isActive\` tinyint NOT NULL DEFAULT '1'`);
    }
}