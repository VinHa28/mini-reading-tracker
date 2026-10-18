import type { ApiErrorBody } from "@/types/api";
import axios, { AxiosError } from "axios";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details: string[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiErrorBody>) => {
    if (err.response) {
      const body = err.response.data;
      return Promise.reject(
        new ApiError(
          body?.message ?? "Đã có lỗi xảy ra",
          err.response.status,
          body?.details,
        ),
      );
    }
    const msg =
      err.code === "ECONNABORTED"
        ? "Máy chủ phản hồi quá chậm, vui lòng thử lại."
        : "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.";
    return Promise.reject(new ApiError(msg, 0));
  },
);
