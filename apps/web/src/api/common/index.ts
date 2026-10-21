export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
