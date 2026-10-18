import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookDetail, BookSummary, SearchResult } from './open-library.types';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

const PAGE_SIZE = 20;
const SEARCH_FIELDS =
  'key,title,author_name,first_publish_year,cover_i,number_of_pages_median';

interface OlSearchDoc {
  key: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  number_of_pages_median?: number;
}

interface OlSearchResponse {
  numFound: number;
  docs: OlSearchDoc[];
}

interface OlWork {
  title?: string;
  description?: string | { value?: string };
  subjects?: string[];
  covers?: number[];
}

@Injectable()
export class OpenLibraryService {
  constructor(private readonly http: HttpService) {}

  async search(q: string, page: number): Promise<SearchResult> {
    const data = await this.get<OlSearchResponse>('/search.json', {
      q,
      page,
      limit: PAGE_SIZE,
      fields: SEARCH_FIELDS,
    });
    return {
      items: data.docs.map((d) => this.toSummary(d)),
      total: data.numFound,
      page,
      pageSize: PAGE_SIZE,
    };
  }

  async getBook(workId: string): Promise<BookDetail> {
    const [work, found] = await Promise.all([
      this.get<OlWork>(`/works/${workId}.json`),
      this.get<OlSearchResponse>('/search.json', {
        q: `key:/works/${workId}`,
        fields: SEARCH_FIELDS,
      }),
    ]);

    const doc = found.docs[0];
    const coverId = doc?.cover_i ?? work.covers?.find((c) => c > 0) ?? null;
    const description =
      typeof work.description === 'string'
        ? work.description
        : (work.description?.value ?? null);

    return {
      workId,
      title: doc?.title ?? work.title ?? 'Untitled',
      authors: doc?.author_name ?? [],
      coverId,
      coverUrl: this.coverUrl(coverId),
      firstPublishYear: doc?.first_publish_year ?? null,
      totalPages: doc?.number_of_pages_median ?? null,
      description,
      subjects: work.subjects ?? [],
    };
  }

  private toSummary(d: OlSearchDoc): BookSummary {
    return {
      workId: d.key.replace('/works/', ''),
      title: d.title ?? 'Untitled',
      authors: d.author_name ?? [],
      coverId: d.cover_i ?? null,
      coverUrl: this.coverUrl(d.cover_i ?? null),
      firstPublishYear: d.first_publish_year ?? null,
      totalPages: d.number_of_pages_median ?? null,
    };
  }

  private coverUrl(coverId: number | null): string | null {
    return coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
      : null;
  }

  private async get<T>(
    path: string,
    params?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const res = await firstValueFrom(this.http.get<T>(path, { params }));
      return res.data;
    } catch (error) {
      const e = error as AxiosError;
      if (e.response?.status === 404) {
        throw new NotFoundException('Book not found on Open Library');
      }
      if (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT') {
        throw new GatewayTimeoutException('Open Library request timed out');
      }
      throw new BadGatewayException('Open Library is unavailable');
    }
  }
}
