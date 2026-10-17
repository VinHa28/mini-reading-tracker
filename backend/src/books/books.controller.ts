import { Controller, Get, Param, Query } from "@nestjs/common";
import { OpenLibraryService } from "../open-library/open-library.service";
import { SearchBooksDTO } from "./dto/search-books.dto";
import { WorkIdParamDTO } from "./dto/work-id-param.dto";

@Controller('books')
export class BooksController {
    constructor(private readonly openLibrary: OpenLibraryService) {}

    @Get('search')
    search(@Query() query: SearchBooksDTO) {
        return this.openLibrary.search(query.q, query.page);
    }

    @Get(':workId')
    getOne(@Param() params: WorkIdParamDTO) {
        return this.openLibrary.getBook(params.workId);
    }
}