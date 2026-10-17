import { Controller, Get, Param, Query } from "@nestjs/common";
import { OpenLibraryService } from "../open-library/open-library.service";
import { SearchBooksDTO } from "./dto/search-books.dto";
import { WorkIdParamDto } from "./dto/work-id-param.dto";

@Controller('books')
export class BooksController {
    constructor(private readonly openLibrary: OpenLibraryService) {}

    @Get('search')
    search(@Query() query: SearchBooksDTO) {
        return this.openLibrary.search(query.q, query.page);
    }

    @Get(':workId')
    getOne(@Param() params: WorkIdParamDto) {
        return this.openLibrary.getBook(params.workId);
    }
}