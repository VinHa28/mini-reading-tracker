import { http } from "@/api/client";
import type { BookSearchResponse } from "@/types/api";

export async function searchBooks(
  q: string,
  page = 1,
): Promise<BookSearchResponse> {
  const { data } = await http.get<BookSearchResponse>("/books/search", {
    params: { q, page },
  });

  return data;
}
