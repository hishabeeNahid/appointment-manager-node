export type ISendResponse<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
