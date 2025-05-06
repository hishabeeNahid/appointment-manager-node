export type ISendResponse<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    next_page_url: string | null;
  };
};
