import { Module } from "@nestjs/common";
import { OpenLibraryModule } from "../open-library/open-library.module";
import { BooksController } from "./books.controller";

@Module({
    imports: [OpenLibraryModule],
    controllers: [BooksController],
})
export class BookModule {}