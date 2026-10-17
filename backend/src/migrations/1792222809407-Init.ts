import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1792222809407 implements MigrationInterface {
    name = 'Init1792222809407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`shelf_books\` (\`id\` int NOT NULL AUTO_INCREMENT, \`work_id\` varchar(32) NOT NULL, \`title\` varchar(500) NOT NULL, \`authors\` varchar(500) NOT NULL, \`cover_id\` int NULL, \`first_publish_year\` int NULL, \`total_pages\` int NULL, \`status\` enum ('WANT_TO_READ', 'READING', 'FINISHED') NOT NULL DEFAULT 'WANT_TO_READ', \`current_page\` int NOT NULL DEFAULT '0', \`rating\` int NULL, \`note\` varchar(500) NULL, \`started_at\` datetime(3) NULL, \`finished_at\` datetime(3) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_7a830da970c9eb4714d9c58799\` (\`work_id\`), INDEX \`IDX_511e2c3ab77edc6e4649e46df8\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_511e2c3ab77edc6e4649e46df8\` ON \`shelf_books\``);
        await queryRunner.query(`DROP INDEX \`IDX_7a830da970c9eb4714d9c58799\` ON \`shelf_books\``);
        await queryRunner.query(`DROP TABLE \`shelf_books\``);
    }

}
