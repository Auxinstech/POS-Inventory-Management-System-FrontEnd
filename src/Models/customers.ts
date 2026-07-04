// types/customer.ts

export interface Customer {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  type: "retail" | "wholesale" | "corporate";
  credit_limit: number;
  balance: number;
  status: boolean;
  created_at?: string;
  updated_at?: string;
  store_id?: number;
}

export interface CreateCustomerData {
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  type: "retail" | "wholesale" | "corporate";
  credit_limit: number;
  balance?: number;
  status?: boolean;
  store_id?: number;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export interface CustomersListParams {
  search?: string;
  paginate?: number;
  per_page?: number;
  sort_by?: string;
  sort?: "asc" | "desc";
  store_id?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
