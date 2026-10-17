import 'dotenv/config';
import { DataSource } from "typeorm";
import { ShelfBook } from "../shelf/shelf-book.entity";

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  timezone: 'Z',
  entities: [ShelfBook],
  migrations: [__dirname + '/../migrations/*.js'],
});
