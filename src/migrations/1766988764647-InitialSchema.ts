import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1766988764647 implements MigrationInterface {
    name = 'InitialSchema1766988764647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Esta migración se mantiene vacía porque sus cambios se consolidaron en SimplifiedResponses
        // Se conserva para no afectar el historial de migraciones ya aplicadas
        console.log('InitialSchema: Cambios consolidados en SimplifiedResponses - no action needed');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rollback vacío por consolidación
        console.log('InitialSchema rollback: No action needed - changes consolidated');
    }

}
