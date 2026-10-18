import { ReadingStatus } from '../shelf/shelf-book.entity';

/**
 * Dữ liệu mẫu: thông tin sách lấy từ Open Library (workId thật), trạng thái đọc do mình đặt.
 * Mọi bản ghi tuân theo quy tắc nghiệp vụ:
 *  - WANT_TO_READ: currentPage = 0, chưa có ngày.
 *  - READING: 0 < currentPage < totalPages (hoặc totalPages = null), có startedAt.
 *  - FINISHED: currentPage = totalPages, có startedAt và finishedAt.
 * Ngày tính theo "số ngày trước hôm nay" để dữ liệu luôn trông mới.
 */
export interface SeedBook {
  workId: string;
  title: string;
  authors: string;
  coverId: number | null;
  firstPublishYear: number | null;
  totalPages: number | null;
  status: ReadingStatus;
  currentPage: number;
  rating: number | null;
  note: string | null;
  startedDaysAgo: number | null;
  finishedDaysAgo: number | null;
}

const { WANT_TO_READ, READING, FINISHED } = ReadingStatus;

export const SEED_BOOKS: SeedBook[] = [
  // --- Đã đọc xong ---
  {
    workId: 'OL468431W',
    title: 'The Great Gatsby',
    authors: 'F. Scott Fitzgerald',
    coverId: 10590366,
    firstPublishYear: 1920,
    totalPages: 185,
    status: FINISHED,
    currentPage: 185,
    rating: 5,
    note: 'Ngắn mà dư vị rất lâu, đoạn kết rất đáng nhớ.',
    startedDaysAgo: 60,
    finishedDaysAgo: 54,
  },
  {
    workId: 'OL1168083W',
    title: 'Nineteen Eighty-Four',
    authors: 'George Orwell',
    coverId: 9267242,
    firstPublishYear: 1949,
    totalPages: 318,
    status: FINISHED,
    currentPage: 318,
    rating: 4,
    note: 'Đọc xong thấy hơi nặng nề nhưng rất đáng đọc.',
    startedDaysAgo: 45,
    finishedDaysAgo: 33,
  },
  {
    workId: 'OL3140822W',
    title: 'To Kill a Mockingbird',
    authors: 'Harper Lee',
    coverId: 14351077,
    firstPublishYear: 1960,
    totalPages: 320,
    status: FINISHED,
    currentPage: 320,
    rating: 5,
    note: null,
    startedDaysAgo: 30,
    finishedDaysAgo: 20,
  },
  {
    workId: 'OL138052W',
    title: "Alice's Adventures in Wonderland",
    authors: 'Lewis Carroll',
    coverId: 10527843,
    firstPublishYear: 1865,
    totalPages: 133,
    status: FINISHED,
    currentPage: 133,
    rating: 3,
    note: null,
    startedDaysAgo: 18,
    finishedDaysAgo: 15,
  },
  {
    workId: 'OL45804W',
    title: 'Fantastic Mr Fox',
    authors: 'Roald Dahl',
    coverId: 6498519,
    firstPublishYear: 1970,
    totalPages: 96,
    status: FINISHED,
    currentPage: 96,
    rating: 4,
    note: 'Đọc một mạch hết trong buổi tối.',
    startedDaysAgo: 8,
    finishedDaysAgo: 8,
  },

  // --- Đang đọc ---
  {
    workId: 'OL82563W',
    title: "Harry Potter and the Philosopher's Stone",
    authors: 'J. K. Rowling',
    coverId: 15155833,
    firstPublishYear: 1997,
    totalPages: 302,
    status: READING,
    currentPage: 180,
    rating: null,
    note: null,
    startedDaysAgo: 5,
    finishedDaysAgo: null,
  },
  {
    workId: 'OL66554W',
    title: 'Pride and Prejudice',
    authors: 'Jane Austen',
    coverId: 14348537,
    firstPublishYear: 1813,
    totalPages: 351,
    status: READING,
    currentPage: 120,
    rating: null,
    note: 'Mới đến đoạn Darcy cầu hôn lần đầu.',
    startedDaysAgo: 10,
    finishedDaysAgo: null,
  },
  {
    workId: 'OL27448W',
    title: 'The Lord of the Rings',
    authors: 'J.R.R. Tolkien',
    coverId: 14625765,
    firstPublishYear: 1954,
    totalPages: 1193,
    status: READING,
    currentPage: 410,
    rating: null,
    note: null,
    startedDaysAgo: 25,
    finishedDaysAgo: null,
  },
  {
    // Sách không có tổng số trang (Open Library thiếu dữ liệu): minh họa trường hợp totalPages = null.
    workId: 'OL20874116W',
    title: 'Harry Potter poster annual 2008',
    authors: 'Warner Bros. Entertainment Inc',
    coverId: 10195373,
    firstPublishYear: 2007,
    totalPages: null,
    status: READING,
    currentPage: 12,
    rating: null,
    note: null,
    startedDaysAgo: 2,
    finishedDaysAgo: null,
  },

  // --- Muốn đọc ---
  {
    workId: 'OL82537W',
    title: 'Harry Potter and the Chamber of Secrets',
    authors: 'J. K. Rowling',
    coverId: 15158664,
    firstPublishYear: 1998,
    totalPages: 339,
    status: WANT_TO_READ,
    currentPage: 0,
    rating: null,
    note: null,
    startedDaysAgo: null,
    finishedDaysAgo: null,
  },
  {
    workId: 'OL82536W',
    title: 'Harry Potter and the Prisoner of Azkaban',
    authors: 'J. K. Rowling',
    coverId: 10580435,
    firstPublishYear: 1999,
    totalPages: 416,
    status: WANT_TO_READ,
    currentPage: 0,
    rating: null,
    note: null,
    startedDaysAgo: null,
    finishedDaysAgo: null,
  },
  {
    workId: 'OL5735363W',
    title: 'The Hunger Games',
    authors: 'Suzanne Collins',
    coverId: 12646537,
    firstPublishYear: 2008,
    totalPages: 397,
    status: WANT_TO_READ,
    currentPage: 0,
    rating: null,
    note: 'Bạn bè giới thiệu, đọc sau khi xong Harry Potter.',
    startedDaysAgo: null,
    finishedDaysAgo: null,
  },
  {
    workId: 'OL16813053W',
    title: 'Words of Radiance',
    authors: 'Brandon Sanderson',
    coverId: 14658334,
    firstPublishYear: 2012,
    totalPages: 1088,
    status: WANT_TO_READ,
    currentPage: 0,
    rating: null,
    note: null,
    startedDaysAgo: null,
    finishedDaysAgo: null,
  },
];
