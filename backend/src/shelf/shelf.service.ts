import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReadingStatus, ShelfBook } from './shelf-book.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { OpenLibraryService } from '../open-library/open-library.service';
import { AddToShelfDTO } from './dto/add-to-shelf.dto';

@Injectable()
export class ShelfService {
    constructor(
        @InjectRepository(ShelfBook)
        private readonly repo: Repository<ShelfBook>,
        private readonly openLibrary: OpenLibraryService
    ) { }

    async add(dto: AddToShelfDTO): Promise<ShelfBook> {
        const book = await this.openLibrary.getBook(dto.workId);
        const now = new Date();

        const entity = this.repo.create({
            workId: book.workId,
            authors: book.authors.join(', '),
            title: book.title,
            coverId: book.coverId,
            firstPublishYear: book.firstPublishYear,
            totalPages: book.totalPages,
            status: dto.status,
            currentPage: 0,
            startedAt: dto.status === ReadingStatus.WANT_TO_READ ? null : now,
            finishedAt: dto.status === ReadingStatus.FINISHED ? now : null
        })

        if (dto.status === ReadingStatus.FINISHED && book.totalPages) {
            entity.currentPage = book.totalPages;
        }

        try {
            return await this.repo.save(entity);
        } catch (error) {
            if (error instanceof QueryFailedError && (error.driverError as {code?:string}).code === "ER_DUP_ENTRY") {
                throw new ConflictException("Sách này đã có trong tủ");
            }
            throw error;
        }
    }
}
