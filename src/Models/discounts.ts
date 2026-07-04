export interface IDiscount {
  id: number;
  store_id: number;
  item_id: number | null;
  is_active: number; // 0 or 1 ONLY
  discount_mode: "percent" | "amount";
  percentage: string | null;
  amount: string | null;
  min_order_value: string | null;
  max_discount: string | null;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  discount_type: "delivery" | "pickup" | "both";
  first_time_users_only: number; // 0 or 1 ONLY
  monday: number; // 0 or 1 ONLY
  tuesday: number; // 0 or 1 ONLY
  wednesday: number; // 0 or 1 ONLY
  thursday: number; // 0 or 1 ONLY
  friday: number; // 0 or 1 ONLY
  saturday: number; // 0 or 1 ONLY
  sunday: number; // 0 or 1 ONLY
  postcode: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  item: IItem | null;
  store: IStore;
}

// This is for CREATE payload (accepts boolean for convenience)
export interface IDiscountCreatePayload {
  store_id: number;
  item_id: number | null;
  is_active: boolean; // Will be converted to 0/1 by backend
  discount_mode: "percent" | "amount";
  percentage: number | null;
  amount: number | null;
  min_order_value: number | null;
  max_discount: number | null;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  discount_type: "delivery" | "pickup" | "both";
  first_time_users_only: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  postcode: string | null;
}

// This is for UPDATE payload (also accepts boolean for convenience)
export interface IDiscountUpdatePayload {
  store_id?: number;
  item_id?: number | null;
  is_active?: boolean; // Will be converted to 0/1 by backend
  discount_mode?: "percent" | "amount";
  percentage?: number | null;
  amount?: number | null;
  min_order_value?: number | null;
  max_discount?: number | null;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  discount_type?: "delivery" | "pickup" | "both";
  first_time_users_only?: boolean;
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
  sunday?: boolean;
  postcode?: string | null;
}

// Keep other types as they were
export interface IStore {
  id: number;
  name: string;
  slug: string;
  address: string;
  postal_code: string;
  url: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface IItem {
  id: number;
  name: string;
  // ... other item fields
}

export interface IDiscountsListParams {
  search?: string;
  paginate?: number;
  per_page?: number;
  sort_by?: string;
  sort?: "asc" | "desc";
  store_id?: number;
  page?: number;
}

export interface IDiscountListResponse {
  current_page: number;
  data: IDiscount[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface DiscountsState {
  discounts: IDiscount[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
