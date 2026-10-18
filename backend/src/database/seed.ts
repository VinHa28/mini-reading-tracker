import dataSource from './data-source';
import { ShelfBook } from '../shelf/shelf-book.entity';
import { SEED_BOOKS } from './seed-data';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Nạp dữ liệu mẫu vào bảng shelf_books.
 *   npm run seed            thêm các sách chưa có (bỏ qua sách đã tồn tại, không xóa gì)
 *   npm run seed -- --reset xóa TOÀN BỘ tủ sách rồi nạp lại (chỉ dùng khi dev, bị chặn ở production)
 */
async function seed() {
  const reset = process.argv.includes('--reset');
  if (reset && process.env.NODE_ENV === 'production') {
    throw new Error('Không cho phép --reset khi NODE_ENV=production');
  }

  await dataSource.initialize();
  try {
    const repo = dataSource.getRepository(ShelfBook);

    if (reset) {
      await repo.clear();
      console.log('Đã xóa toàn bộ sách trong tủ.');
    }

    const existing = new Set(
      (await repo.find({ select: { workId: true } })).map((b) => b.workId),
    );
    const now = Date.now();
    const daysAgo = (n: number) => new Date(now - n * DAY_MS);

    // Thêm từ cũ đến mới để thứ tự createdAt/updatedAt hợp lý.
    const todo = SEED_BOOKS.filter((b) => !existing.has(b.workId)).sort(
      (a, b) =>
        (b.startedDaysAgo ?? -1) - (a.startedDaysAgo ?? -1) ||
        a.workId.localeCompare(b.workId),
    );

    for (const b of todo) {
      const touchedAt = daysAgo(b.finishedDaysAgo ?? b.startedDaysAgo ?? 0);
      await repo.save(
        repo.create({
          workId: b.workId,
          title: b.title,
          authors: b.authors,
          coverId: b.coverId,
          firstPublishYear: b.firstPublishYear,
          totalPages: b.totalPages,
          status: b.status,
          currentPage: b.currentPage,
          rating: b.rating,
          note: b.note,
          startedAt:
            b.startedDaysAgo === null ? null : daysAgo(b.startedDaysAgo),
          finishedAt:
            b.finishedDaysAgo === null ? null : daysAgo(b.finishedDaysAgo),
          createdAt: daysAgo((b.startedDaysAgo ?? 0) + 1),
          updatedAt: touchedAt,
        }),
      );
    }

    console.log(
      `Seed xong: thêm ${todo.length} sách, bỏ qua ${SEED_BOOKS.length - todo.length} sách đã có.`,
    );
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
