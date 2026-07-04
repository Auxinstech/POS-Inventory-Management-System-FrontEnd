// category.ts

import { Store } from "Redux/Ducks/homeSlice";
import { Item } from "./item";

// ------------------- Schedule Types -------------------

export type Day =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export const DAYS: Day[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export type ScheduleType = "NONE" | "DAILY" | "WEEKLY";

// Daily schedule (no days)
export interface ScheduleConfigDaily {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

// Weekly schedule (with days)
export interface ScheduleConfigWeekly extends ScheduleConfigDaily {
  days: Day[];
}

// Union type for ScheduleState
export type ScheduleState =
  | { schedule: "NONE"; schedule_config: null }
  | { schedule: "DAILY"; schedule_config: ScheduleConfigDaily }
  | { schedule: "WEEKLY"; schedule_config: ScheduleConfigWeekly };

export interface CreateCategoryRequest {
  name: string;
  description: string;
  image: string;
  status: string;
  store_id: number;
  vat_percent: number;
  category_availability: string;
  // image?: string;
  available_for_delivery: boolean;
  available_for_pickup: boolean;
  eligible_online_discount: boolean;
  eligible_collection_discount: boolean;
  allow_coupon: boolean;
  excluded_free_gift: boolean;
  food_section: string;
  offer: string;
  parent_id: number | null;
  // sections?: number[];
  schedule: ScheduleState["schedule"];
  schedule_config: ScheduleState["schedule_config"];
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
  id: number;
}

export interface CreateCategoryResponse {
  id: number;
  name: string;
  description: string | null;
  status: string;
  store_id: number;
  vat_percent: number;
  category_availability: string;
  image?: string;
  available_for_delivery: boolean;
  available_for_pickup: boolean;
  eligible_online_discount: boolean;
  eligible_collection_discount: boolean;
  allow_coupon: boolean;
  excluded_free_gift: boolean;
  food_section: string;
  offer: string;
  createdAt: string;
  updatedAt: string;
  schedule: ScheduleState["schedule"];
  schedule_config: ScheduleState["schedule_config"];
}

export type UpdateCategoryResponse = CreateCategoryResponse;

export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  status: string;
  store_id: number;
  vat_percent: number;
  category_availability: string;
  //   schedule: string | null;
  image: string | null;
  available_for_delivery: boolean;
  available_for_pickup: boolean;
  //   eligible_online_discount: boolean;
  //   eligible_collection_discount: boolean;
  //   allow_coupon: boolean;
  //   excluded_free_gift: boolean;
  //   food_section: string;
  //   offer: string;
  parent_id: number | null;
  //   created_at: string;
  updated_at: string;
  //   store: Store;
  items: Item[];
  //   sections: any[]; // You gave empty array. Please share structure if available
  children: Category[]; // recursive for subcategories
  schedule: ScheduleState["schedule"];
  schedule_config: ScheduleState["schedule_config"];
}
