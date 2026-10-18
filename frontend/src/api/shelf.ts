import { http } from "@/api/client";
import type { ReadingStatus, ShelfBook } from "@/types/api";

export async function addToShelf(
  workId: string,
  status?: ReadingStatus,
): Promise<ShelfBook> {
  const { data } = await http.post<ShelfBook>("/shelf", { workId, status });
  return data;
}
