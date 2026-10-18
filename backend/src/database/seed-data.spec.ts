import { ReadingStatus } from '../shelf/shelf-book.entity';
import { SEED_BOOKS } from './seed-data';

describe('SEED_BOOKS', () => {
  it('không có workId trùng và đúng định dạng OL...W', () => {
    const ids = SEED_BOOKS.map((b) => b.workId);

    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^OL\d+W$/));
  });

  it('có đủ ba trạng thái để minh họa các tab', () => {
    const statuses = new Set(SEED_BOOKS.map((b) => b.status));

    expect(statuses).toEqual(
      new Set([
        ReadingStatus.WANT_TO_READ,
        ReadingStatus.READING,
        ReadingStatus.FINISHED,
      ]),
    );
  });

  it.each(SEED_BOOKS.map((b) => [b.title, b] as const))(
    '%s tuân thủ quy tắc nghiệp vụ',
    (_title, b) => {
      if (b.rating !== null) {
        expect(Number.isInteger(b.rating)).toBe(true);
        expect(b.rating).toBeGreaterThanOrEqual(1);
        expect(b.rating).toBeLessThanOrEqual(5);
      }
      if (b.note !== null) expect(b.note.length).toBeLessThanOrEqual(500);
      if (b.totalPages !== null) {
        expect(b.currentPage).toBeLessThanOrEqual(b.totalPages);
      }

      switch (b.status) {
        case ReadingStatus.WANT_TO_READ:
          expect(b.currentPage).toBe(0);
          expect(b.startedDaysAgo).toBeNull();
          expect(b.finishedDaysAgo).toBeNull();
          break;
        case ReadingStatus.READING:
          expect(b.startedDaysAgo).not.toBeNull();
          expect(b.finishedDaysAgo).toBeNull();
          expect(b.currentPage).toBeGreaterThan(0);
          if (b.totalPages !== null) {
            expect(b.currentPage).toBeLessThan(b.totalPages);
          }
          break;
        case ReadingStatus.FINISHED:
          expect(b.startedDaysAgo).not.toBeNull();
          expect(b.finishedDaysAgo).not.toBeNull();
          expect(b.finishedDaysAgo!).toBeLessThanOrEqual(b.startedDaysAgo!);
          expect(b.currentPage).toBe(b.totalPages);
          break;
      }
    },
  );
});
