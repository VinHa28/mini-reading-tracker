import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReadingStatus, ShelfBook } from './shelf-book.entity';
import { In, QueryFailedError, Repository } from 'typeorm';
import { OpenLibraryService } from '../open-library/open-library.service';
import { AddToShelfDTO } from './dto/add-to-shelf.dto';
import { UpdateShelfDTO } from './dto/update-shelf.dto';
import { applyUpdate } from './shelf-rules';

@Injectable()
export class ShelfService {
  constructor(
    @InjectRepository(ShelfBook)
    private readonly repo: Repository<ShelfBook>,
    private readonly openLibrary: OpenLibraryService,
  ) {}

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
      finishedAt: dto.status === ReadingStatus.FINISHED ? now : null,
    });

    if (dto.status === ReadingStatus.FINISHED && book.totalPages) {
      entity.currentPage = book.totalPages;
    }

    try {
      return await this.repo.save(entity);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Sách này đã có trong tủ');
      }
      throw error;
    }
  }

  list(status?: ReadingStatus): Promise<ShelfBook[]> {
    return this.repo.find({
      where: status ? { status } : {},
      order: { updatedAt: 'DESC' },
    });
  }

  async stats() {
    const rows = await this.repo
      .createQueryBuilder('b')
      .select('b.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('b.status')
      .getRawMany<{ status: ReadingStatus; count: string }>();

    const counts: Record<ReadingStatus, number> = {
      [ReadingStatus.WANT_TO_READ]: 0,
      [ReadingStatus.READING]: 0,
      [ReadingStatus.FINISHED]: 0,
    };

    for (const r of rows) counts[r.status] = Number(r.count);

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { ...counts, total };
  }

  async findById(id: number): Promise<ShelfBook> {
    const book = await this.repo.findOneBy({ id });
    if (!book) throw new NotFoundException('Không tìm thấy sách trong tủ.');
    return book;
  }

  async update(id: number, dto: UpdateShelfDTO): Promise<ShelfBook> {
    const book = await this.findById(id);
    applyUpdate(book, dto, new Date());
    return this.repo.save(book);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('Không tìm thấy sách trong tủ.');
    }
  }

  async findShelfIdsByWorkIds(workIds: string[]): Promise<Map<string, number>> {
    if (workIds.length === 0) return new Map();
    const rows = await this.repo.find({
      select: { id: true, workId: true },
      where: { workId: In(workIds) },
    });
    return new Map(rows.map((r) => [r.workId, r.id]));
  }
}
