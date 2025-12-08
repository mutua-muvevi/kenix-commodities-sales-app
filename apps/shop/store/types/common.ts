// store/types/common.ts
export interface Pagination {
  hasNextPage: boolean;
  nextCursor: string | null;
  totalCount: number;
  limit: number;
  currentPage?: number;
  totalPages?: number;
}

export interface BaseState {
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  user?: any;
  accessToken?: string;
  refreshToken?: string;
}
