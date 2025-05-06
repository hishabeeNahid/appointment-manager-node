export type IPaginationQuery = {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
};

export type IPaginationOptions = {
  page: number;
  limit: number;
  skip: number;
  sort: {
    [key: string]: string;
  };
};
