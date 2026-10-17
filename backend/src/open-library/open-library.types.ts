
export interface BookSummary {
    workId: string;
    title: string;
    authors: string[];
    coverId: number | null;
    coverUrl: string | null;
    firstPublishYear: number | null;
    totalPages: number | null;
}

export interface SearchResult {
    items: BookSummary[];
    total: number;
    page: number;
    pageSize: number
}

export interface BookDetail extends BookSummary {
    description: string | null;
    subjects: string[]
}