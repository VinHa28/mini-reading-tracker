import { BadRequestException } from '@nestjs/common';
import { ReadingStatus, ShelfBook } from './shelf-book.entity';

export interface ShelfUpdateInput {
  currentPage?: number | null;
  status?: ReadingStatus | null;
  rating?: number | null;
  note?: string | null;
}

export function applyUpdate(
  book: ShelfBook,
  input: ShelfUpdateInput,
  now: Date,
): void {
  const page = input.currentPage ?? undefined;
  const status = input.status ?? undefined;

  if (
    page === undefined &&
    status === undefined &&
    input.rating === undefined &&
    input.note === undefined
  ) {
    throw new BadRequestException(
      'Phải cung cấp ít nhất một trong các thông tin: currentPage, status, rating, note',
    );
  }

  const total = book.totalPages;
  const hasTotal = total !== null && total > 0;

  if (page !== undefined && hasTotal && page > total) {
    throw new BadRequestException(
      `currentPage không được vượt quá totalPage (${total})`,
    );
  }

  if (
    status === ReadingStatus.FINISHED &&
    page !== undefined &&
    hasTotal &&
    page < total
  ) {
    throw new BadRequestException(
      `Không thể đặt trạng thái FINISHED khi currentPage (${page}) nhỏ hơn totalPage (${total})`,
    );
  }

  // cho rating ở mọi trạng thái. null = xóa.
  if (input.rating !== undefined) book.rating = input.rating;
  // note đã được trim() ở DTO
  if (input.note !== undefined) book.note = input.note === '' ? null : input.note;

  if (status !== undefined && status !== book.status) {
    applyStatus(book, status, hasTotal ? total : null, now);
  }

  if (page === undefined) return;

  book.currentPage = page;

  if (hasTotal && page === total) {
    book.status = ReadingStatus.FINISHED;
    book.startedAt = book.startedAt ?? now;
    book.finishedAt = book.finishedAt ?? now;
    return;
  }

  if (status !== undefined) return;

  if (book.status === ReadingStatus.FINISHED) {
    book.status = ReadingStatus.READING;
    book.finishedAt = null;
  }
  if (book.status === ReadingStatus.WANT_TO_READ && page > 0) {
    book.status = ReadingStatus.READING;
  }
  if (book.status === ReadingStatus.READING) {
    book.startedAt = book.startedAt ?? now;
  }
}

function applyStatus(
  book: ShelfBook,
  status: ReadingStatus,
  total: number | null,
  now: Date,
): void {
  book.status = status;
  switch (status) {
    case ReadingStatus.READING:
      book.startedAt = book.startedAt ?? now;
      book.finishedAt = null;
      break;
    case ReadingStatus.FINISHED:
      book.startedAt = book.startedAt ?? now;
      book.finishedAt = now;
      if (total !== null) book.currentPage = total;
      break;
    case ReadingStatus.WANT_TO_READ:
      break;
  }
}
