import { Injectable } from '@nestjs/common';
import { OpenLibraryService } from '../open-library/open-library.service';
import { ShelfService } from '../shelf/shelf.service';

@Injectable()
export class BooksService {
  constructor(
    private readonly openLibrary: OpenLibraryService,
    private readonly shelf: ShelfService,
  ) {}

  async search(q: string, page: number) {
    const result = await this.openLibrary.search(q, page);
    const ids = await this.shelf.findShelfIdsByWorkIds(
      result.items.map((i) => i.workId),
    );

    return {
      ...result,
      items: result.items.map((i) => ({
        ...i,
        inShelf: ids.has(i.workId),
        shelfBookId: ids.get(i.workId) ?? null,
      })),
    };
  }

  async getOne(workId: string) {
    const [book, ids] = await Promise.all([
      this.openLibrary.getBook(workId),
      this.shelf.findShelfIdsByWorkIds([workId]),
    ]);

    return {
      ...book,
      inShelf: ids.has(workId),
      shelfBookId: ids.get(workId) ?? null,
    };
  }
}
