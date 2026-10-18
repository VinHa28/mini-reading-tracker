import { http } from "@/api/client";
import type { ReadingStatus, ShelfBook, UpdateShelfPayload } from "@/types/api";

export async function getShelf(status?: ReadingStatus): Promise<ShelfBook[]> {
  const { data } = await http.get<ShelfBook[]>("/shelf", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function addToShelf(
  workId: string,
  status?: ReadingStatus,
): Promise<ShelfBook> {
  const { data } = await http.post<ShelfBook>("/shelf", { workId, status });
  return data;
}

export async function updateShelfBook(
  id: number,
  payload: UpdateShelfPayload,
): Promise<ShelfBook> {
  const { data } = await http.patch<ShelfBook>(`/shelf/${id}`, payload);
  return data;
}

export async function removeShelfBook(id: number): Promise<void> {
  await http.delete(`/shelf/${id}`);
}