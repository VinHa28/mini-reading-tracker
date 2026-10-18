import { ReadingStatus, ShelfBook } from './shelf-book.entity';
import { ShelfRuleError, applyUpdate } from './shelf-rules';

const NOW = new Date('2026-01-10T00:00:00.000Z');
const EARLIER = new Date('2026-01-01T00:00:00.000Z');

// Sách mẫu 300 trang, chưa đọc.
function makeBook(overrides: Partial<ShelfBook> = {}): ShelfBook {
  return Object.assign(new ShelfBook(), {
    id: 1,
    workId: 'OL1W',
    status: ReadingStatus.WANT_TO_READ,
    currentPage: 0,
    totalPages: 300,
    rating: null,
    note: null,
    startedAt: null,
    finishedAt: null,
    ...overrides,
  });
}

// Copy độc lập (giữ cả Date) để so sánh "trước" và "sau".
const snapshot = (book: ShelfBook) => structuredClone(book);

describe('applyUpdate', () => {
  describe('validation', () => {
    it.each([
      ['không gửi trường nào', {}],
      ['chỉ gửi status = null', { status: null }],
      ['chỉ gửi currentPage = null', { currentPage: null }],
    ])('ném lỗi nghiệp vụ khi %s', (_name, input) => {
      const book = makeBook();

      expect(() => applyUpdate(book, input, NOW)).toThrow(ShelfRuleError);
    });

    it('ném lỗi nghiệp vụ khi currentPage vượt quá totalPages, sách không bị đổi', () => {
      const book = makeBook({ status: ReadingStatus.READING, currentPage: 10 });
      const before = snapshot(book);

      expect(() => applyUpdate(book, { currentPage: 301 }, NOW)).toThrow(
        ShelfRuleError,
      );
      expect(book).toEqual(before);
    });

    it('ném lỗi nghiệp vụ khi FINISHED mà currentPage chưa đủ trang, sách không bị đổi', () => {
      const book = makeBook({ status: ReadingStatus.READING, currentPage: 10 });
      const before = snapshot(book);

      expect(() =>
        applyUpdate(
          book,
          { status: ReadingStatus.FINISHED, currentPage: 100 },
          NOW,
        ),
      ).toThrow(ShelfRuleError);
      expect(book).toEqual(before);
    });

    it('lỗi vượt trang không làm hỏng rating/note gửi cùng request', () => {
      const book = makeBook();
      const before = snapshot(book);

      expect(() =>
        applyUpdate(book, { currentPage: 999, rating: 5, note: 'hay' }, NOW),
      ).toThrow(ShelfRuleError);
      expect(book).toEqual(before);
    });
  });

  describe('chỉ gửi currentPage', () => {
    it('WANT_TO_READ chuyển sang READING khi đọc trang đầu tiên', () => {
      const book = makeBook();

      applyUpdate(book, { currentPage: 10 }, NOW);

      expect(book.status).toBe(ReadingStatus.READING);
      expect(book.currentPage).toBe(10);
      expect(book.startedAt).toEqual(NOW);
      expect(book.finishedAt).toBeNull();
    });

    it('WANT_TO_READ với currentPage = 0 thì giữ nguyên trạng thái', () => {
      const book = makeBook();

      applyUpdate(book, { currentPage: 0 }, NOW);

      expect(book.status).toBe(ReadingStatus.WANT_TO_READ);
      expect(book.startedAt).toBeNull();
    });

    it('READING giữ nguyên startedAt cũ khi đổi trang', () => {
      const book = makeBook({
        status: ReadingStatus.READING,
        currentPage: 10,
        startedAt: EARLIER,
      });

      applyUpdate(book, { currentPage: 50 }, NOW);

      expect(book.status).toBe(ReadingStatus.READING);
      expect(book.currentPage).toBe(50);
      expect(book.startedAt).toEqual(EARLIER);
    });

    it('trang áp chót (total - 1) vẫn là READING', () => {
      const book = makeBook({
        status: ReadingStatus.READING,
        startedAt: EARLIER,
      });

      applyUpdate(book, { currentPage: 299 }, NOW);

      expect(book.status).toBe(ReadingStatus.READING);
      expect(book.finishedAt).toBeNull();
    });

    it('đọc đến trang cuối thì tự động FINISHED và giữ startedAt cũ', () => {
      const book = makeBook({
        status: ReadingStatus.READING,
        currentPage: 100,
        startedAt: EARLIER,
      });

      applyUpdate(book, { currentPage: 300 }, NOW);

      expect(book.status).toBe(ReadingStatus.FINISHED);
      expect(book.currentPage).toBe(300);
      expect(book.finishedAt).toEqual(NOW);
      expect(book.startedAt).toEqual(EARLIER);
    });

    it('nhảy thẳng từ WANT_TO_READ đến trang cuối thì startedAt = now', () => {
      const book = makeBook();

      applyUpdate(book, { currentPage: 300 }, NOW);

      expect(book.status).toBe(ReadingStatus.FINISHED);
      expect(book.startedAt).toEqual(NOW);
      expect(book.finishedAt).toEqual(NOW);
    });

    it('đã FINISHED, gửi lại trang cuối thì finishedAt không bị ghi đè', () => {
      const book = makeBook({
        status: ReadingStatus.FINISHED,
        currentPage: 300,
        startedAt: EARLIER,
        finishedAt: EARLIER,
      });

      applyUpdate(book, { currentPage: 300 }, NOW);

      expect(book.status).toBe(ReadingStatus.FINISHED);
      expect(book.finishedAt).toEqual(EARLIER);
    });

    it('FINISHED mà lùi trang thì về READING và xóa finishedAt', () => {
      const book = makeBook({
        status: ReadingStatus.FINISHED,
        currentPage: 300,
        startedAt: EARLIER,
        finishedAt: EARLIER,
      });

      applyUpdate(book, { currentPage: 299 }, NOW);

      expect(book.status).toBe(ReadingStatus.READING);
      expect(book.currentPage).toBe(299);
      expect(book.finishedAt).toBeNull();
      expect(book.startedAt).toEqual(EARLIER);
    });

    it('sách không có totalPages: nhận trang bất kỳ, không tự FINISHED', () => {
      const book = makeBook({ totalPages: null });

      applyUpdate(book, { currentPage: 99999 }, NOW);

      expect(book.status).toBe(ReadingStatus.READING);
      expect(book.currentPage).toBe(99999);
      expect(book.finishedAt).toBeNull();
    });
  });

  describe('đổi status', () => {
    it('WANT_TO_READ -> READING: gán startedAt, finishedAt null', () => {
      const book = makeBook();

      applyUpdate(book, { status: ReadingStatus.READING }, NOW);

      expect(book.status).toBe(ReadingStatus.READING);
      expect(book.startedAt).toEqual(NOW);
      expect(book.finishedAt).toBeNull();
    });

    it('READING -> FINISHED: gán finishedAt, điền currentPage = totalPages, giữ startedAt', () => {
      const book = makeBook({
        status: ReadingStatus.READING,
        currentPage: 120,
        startedAt: EARLIER,
      });

      applyUpdate(book, { status: ReadingStatus.FINISHED }, NOW);

      expect(book.status).toBe(ReadingStatus.FINISHED);
      expect(book.currentPage).toBe(300);
      expect(book.finishedAt).toEqual(NOW);
      expect(book.startedAt).toEqual(EARLIER);
    });

    it('WANT_TO_READ -> FINISHED: startedAt cũng được gán', () => {
      const book = makeBook();

      applyUpdate(book, { status: ReadingStatus.FINISHED }, NOW);

      expect(book.startedAt).toEqual(NOW);
      expect(book.finishedAt).toEqual(NOW);
    });

    it('sách không có totalPages -> FINISHED: giữ nguyên currentPage', () => {
      const book = makeBook({
        status: ReadingStatus.READING,
        totalPages: null,
        currentPage: 40,
        startedAt: EARLIER,
      });

      applyUpdate(book, { status: ReadingStatus.FINISHED }, NOW);

      expect(book.status).toBe(ReadingStatus.FINISHED);
      expect(book.currentPage).toBe(40);
      expect(book.finishedAt).toEqual(NOW);
    });

    it('FINISHED -> READING: xóa finishedAt, giữ startedAt', () => {
      const book = makeBook({
        status: ReadingStatus.FINISHED,
        currentPage: 300,
        startedAt: EARLIER,
        finishedAt: EARLIER,
      });

      applyUpdate(book, { status: ReadingStatus.READING }, NOW);

      expect(book.status).toBe(ReadingStatus.READING);
      expect(book.finishedAt).toBeNull();
      expect(book.startedAt).toEqual(EARLIER);
    });

    it('chuyển về WANT_TO_READ: giữ nguyên currentPage, startedAt, finishedAt', () => {
      const book = makeBook({
        status: ReadingStatus.READING,
        currentPage: 20,
        startedAt: EARLIER,
      });

      applyUpdate(book, { status: ReadingStatus.WANT_TO_READ }, NOW);

      expect(book.status).toBe(ReadingStatus.WANT_TO_READ);
      expect(book.currentPage).toBe(20);
      expect(book.startedAt).toEqual(EARLIER);
      expect(book.finishedAt).toBeNull();
    });

    it('đã FINISHED, gửi lại FINISHED thì finishedAt không bị ghi đè', () => {
      const book = makeBook({
        status: ReadingStatus.FINISHED,
        currentPage: 300,
        startedAt: EARLIER,
        finishedAt: EARLIER,
      });
      const before = snapshot(book);

      applyUpdate(book, { status: ReadingStatus.FINISHED }, NOW);

      expect(book).toEqual(before);
    });

    it('status trùng hiện tại thì không đổi gì cả', () => {
      const book = makeBook({
        status: ReadingStatus.READING,
        currentPage: 20,
        startedAt: EARLIER,
      });
      const before = snapshot(book);

      applyUpdate(book, { status: ReadingStatus.READING }, NOW);

      expect(book).toEqual(before);
    });
  });

  describe('gửi cả status và currentPage', () => {
    it('READING + currentPage hợp lệ: áp dụng cả hai', () => {
      const book = makeBook();

      applyUpdate(
        book,
        { status: ReadingStatus.READING, currentPage: 50 },
        NOW,
      );

      expect(book.status).toBe(ReadingStatus.READING);
      expect(book.currentPage).toBe(50);
      expect(book.startedAt).toEqual(NOW);
    });

    it('READING + currentPage = totalPages: đủ trang thì FINISHED thắng', () => {
      const book = makeBook();

      applyUpdate(
        book,
        { status: ReadingStatus.READING, currentPage: 300 },
        NOW,
      );

      expect(book.status).toBe(ReadingStatus.FINISHED);
      expect(book.finishedAt).toEqual(NOW);
    });

    it('WANT_TO_READ + currentPage > 0: status do người dùng chọn không bị tự đổi', () => {
      const book = makeBook();

      applyUpdate(
        book,
        { status: ReadingStatus.WANT_TO_READ, currentPage: 50 },
        NOW,
      );

      expect(book.status).toBe(ReadingStatus.WANT_TO_READ);
      expect(book.currentPage).toBe(50);
      expect(book.startedAt).toBeNull();
    });

    it('FINISHED + currentPage = totalPages: hợp lệ', () => {
      const book = makeBook({
        status: ReadingStatus.READING,
        startedAt: EARLIER,
      });

      applyUpdate(
        book,
        { status: ReadingStatus.FINISHED, currentPage: 300 },
        NOW,
      );

      expect(book.status).toBe(ReadingStatus.FINISHED);
      expect(book.currentPage).toBe(300);
      expect(book.finishedAt).toEqual(NOW);
    });
  });

  describe('rating và note', () => {
    it('lưu rating ở trạng thái WANT_TO_READ và không đụng tới trường khác', () => {
      const book = makeBook();

      applyUpdate(book, { rating: 4 }, NOW);

      expect(book.rating).toBe(4);
      expect(book.status).toBe(ReadingStatus.WANT_TO_READ);
      expect(book.currentPage).toBe(0);
      expect(book.startedAt).toBeNull();
    });

    it('rating = null thì xóa đánh giá (và không bị coi là body rỗng)', () => {
      const book = makeBook({ rating: 5 });

      applyUpdate(book, { rating: null }, NOW);

      expect(book.rating).toBeNull();
    });

    it('không gửi rating thì giữ rating cũ', () => {
      const book = makeBook({ rating: 5 });

      applyUpdate(book, { note: 'hay' }, NOW);

      expect(book.rating).toBe(5);
      expect(book.note).toBe('hay');
    });

    it('note rỗng hoặc null thì lưu null', () => {
      const withEmpty = makeBook({ note: 'cũ' });
      const withNull = makeBook({ note: 'cũ' });

      applyUpdate(withEmpty, { note: '' }, NOW);
      applyUpdate(withNull, { note: null }, NOW);

      expect(withEmpty.note).toBeNull();
      expect(withNull.note).toBeNull();
    });

    it('không gửi note thì giữ note cũ', () => {
      const book = makeBook({ note: 'cũ' });

      applyUpdate(book, { rating: 3 }, NOW);

      expect(book.note).toBe('cũ');
    });

    it('rating gửi cùng status: áp dụng cả hai', () => {
      const book = makeBook({
        status: ReadingStatus.READING,
        startedAt: EARLIER,
      });

      applyUpdate(book, { rating: 5, status: ReadingStatus.FINISHED }, NOW);

      expect(book.rating).toBe(5);
      expect(book.status).toBe(ReadingStatus.FINISHED);
    });

    it('đổi status hoặc currentPage không làm mất rating và note', () => {
      const book = makeBook({
        status: ReadingStatus.READING,
        startedAt: EARLIER,
        rating: 2,
        note: 'ghi chú',
      });

      applyUpdate(book, { currentPage: 300 }, NOW);

      expect(book.status).toBe(ReadingStatus.FINISHED);
      expect(book.rating).toBe(2);
      expect(book.note).toBe('ghi chú');
    });
  });
});
