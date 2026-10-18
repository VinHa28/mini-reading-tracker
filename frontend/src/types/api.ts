export type ReadingStatus = "WANT_TO_READ" | "READING" | "FINISHED";

export interface BookSummary {
  workId: string;
  title: string;
  authors: string[];
  coverId: number | null;
  coverUrl: string | null;
  firstPublishYear: number | null;
  totalPages: number | null;
  inShelf: boolean;
  shelfBookId: number | null;
}

export interface BookSearchResponse {
  items: BookSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ShelfBook {
  id: number;
  workId: string;
  title: string;
  authors: string; // backend nối bằng dấu phẩy, KHÁC BookSummary (mảng)
  coverId: number | null;
  firstPublishYear: number | null;
  totalPages: number | null;
  status: ReadingStatus;
  currentPage: number;
  rating: number | null;
  note: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShelfStats {
  WANT_TO_READ: number;
  READING: number;
  FINISHED: number;
  total: number;
}

export interface UpdateShelfPayload {
  currentPage?: number;
  status?: ReadingStatus;
  rating?: number | null;
  note?: string | null;
}

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string;
  details?: string[];
  path: string;
  timestamp: string;
}
