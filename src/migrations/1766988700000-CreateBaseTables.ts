import { MigrationInterface, QueryRunner, Table, Index } from "typeorm";

export class CreateBaseTables1766988700000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla teams
        await queryRunner.createTable(
            new Table({
                name: "teams",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "100",
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "isActive",
                        type: "tinyint",
                        default: 1,
                    },
                    {
                        name: "createdAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Crear tabla users
        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "email",
                        type: "varchar",
                        length: "100",
                        isUnique: true,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "100",
                    },
                    {
                        name: "password",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "role",
                        type: "enum",
                        enum: ["user", "editor", "admin"],
                        default: "'user'",
                    },
                    {
                        name: "isActive",
                        type: "tinyint",
                        default: 1,
                    },
                    {
                        name: "teamId",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "createdAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["teamId"],
                        referencedTableName: "teams",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
                indices: [
                    {
                        name: "IDX_USERS_TEAM_ID",
                        columnNames: ["teamId"],
                    },
                ],
            }),
            true
        );

        // Crear tabla questionnaires
        await queryRunner.createTable(
            new Table({
                name: "questionnaires",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "200",
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "isActive",
                        type: "tinyint",
                        default: 1,
                    },
                    {
                        name: "createdById",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "createdAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["createdById"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
                indices: [
                    {
                        name: "IDX_QUESTIONNAIRES_CREATED_BY",
                        columnNames: ["createdById"],
                    },
                ],
            }),
            true
        );

        // Crear tabla questions
        await queryRunner.createTable(
            new Table({
                name: "questions",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "text",
                        type: "varchar",
                        length: "500",
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: ["radio", "checkbox", "text", "textarea", "select", "number", "image", "gps", "gps_manual"],
                    },
                    {
                        name: "options",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "isRequired",
                        type: "tinyint",
                        default: 0,
                    },
                    {
                        name: "order",
                        type: "int",
                    },
                    {
                        name: "questionnaireId",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "createdAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["questionnaireId"],
                        referencedTableName: "questionnaires",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
                indices: [
                    {
                        name: "IDX_QUESTIONS_QUESTIONNAIRE_ID",
                        columnNames: ["questionnaireId"],
                    },
                    {
                        name: "IDX_QUESTIONS_ORDER",
                        columnNames: ["questionnaireId", "order"],
                    },
                ],
            }),
            true
        );

        // Crear tabla responses
        await queryRunner.createTable(
            new Table({
                name: "responses",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "surveyId",
                        type: "varchar",
                        length: "200",
                    },
                    {
                        name: "answers",
                        type: "json",
                    },
                    {
                        name: "metadata",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "version",
                        type: "int",
                        default: 1,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["draft", "final", "synchronized"],
                        default: "'draft'",
                    },
                    {
                        name: "finalizedAt",
                        type: "datetime",
                        isNullable: true,
                    },
                    {
                        name: "userId",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "createdAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["userId"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
                indices: [
                    {
                        name: "IDX_RESPONSES_USER_ID",
                        columnNames: ["userId"],
                    },
                    {
                        name: "IDX_RESPONSES_SURVEY_ID",
                        columnNames: ["surveyId"],
                    },
                    {
                        name: "IDX_RESPONSES_STATUS",
                        columnNames: ["status"],
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("responses");
        await queryRunner.dropTable("questions");
        await queryRunner.dropTable("questionnaires");
        await queryRunner.dropTable("users");
        await queryRunner.dropTable("teams");
    }

}
