import { PaginatedResponse } from "shared/interfaces/paginated.response.interface";
import { PaginationInterface } from "shared/interfaces/pagination.interface";

export async function paginate<T>(
  queryFn: () => Promise<[T[], number]>,
  pagination: PaginationInterface
): Promise<PaginatedResponse<T>> {
  const [data, total] = await queryFn();

  return {
    data,
    total,
    page: pagination.page,
    offset: pagination.offset,
    total_pages: Math.ceil(total / pagination.offset),
  };
}
