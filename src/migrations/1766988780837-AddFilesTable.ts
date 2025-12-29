import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddFilesTable1766988780837 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "files",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "responseId",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "filename",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "mimeType",
                        type: "varchar",
                        length: "100",
                    },
                    {
                        name: "fileSize",
                        type: "int",
                    },
                    {
                        name: "createdAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
                indices: [
                    {
                        name: "IDX_FILES_RESPONSE_ID",
                        columnNames: ["responseId"],
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("files");
    }

}
