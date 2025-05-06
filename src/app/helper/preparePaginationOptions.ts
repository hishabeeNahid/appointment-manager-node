import { IPaginationQuery } from '../../interface/pagination';

const preparePaginationOptions = ({
  sortBy = 'createdAt',
  sortOrder = 'desc',
  ...options
}: IPaginationQuery) => {
  const page = options.page ? parseInt(options.page) : 1;
  const limit = options.limit ? parseInt(options.limit) : 10;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };
  const paginationOptions = { page, limit, skip, sort };
  return paginationOptions;
};

export default preparePaginationOptions;
