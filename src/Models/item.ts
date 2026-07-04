// item.ts

import { Category } from "./category";
import { Modifier } from "./modifier";
import { ModifierGroup } from "./modifierGroup";

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

// ------------------- Item Interfaces -------------------

export interface CreateItemRequest {
  name: string;
  type: string;
  description: string;
  price: number;
  min: number;
  max: number;
  image: string;
  is_active: boolean;
  vat_percent: number;
  item_availability: string;
  eligible_online_discount: boolean;
  eligible_collection_discount: boolean;
  allow_coupon: boolean;
  excluded_free_gift: boolean;
  contains_alcohol: boolean;
  contains_tobacco: boolean;
  food_type: string;
  offer: string;
  barcode: string;
  calories: string;
  serving_size: string;
  store_id: number;
  categories: number[];
  stock: number;
  unit: string;

  default_quantity: number;
  default_discount: number;
  default_discount_type: string;
  available_for_delivery: boolean;
  available_for_pickup: boolean;

  schedule: ScheduleState["schedule"];
  schedule_config: ScheduleState["schedule_config"];
}

// Update request with extra fields
export interface UpdateItemRequest extends CreateItemRequest {
  id: number;
  allergens: number[];
  modifier_groups: number[];
}

// Full item type (from backend)
export interface Item {
  id: number;
  name: string;
  type: string;
  slug: string;
  description: string;
  price: number;
  sort: number;
  min: number;
  max: number;
  image: string;
  is_active: boolean;
  vat_percent: number;
  item_availability: string;
  eligible_online_discount: boolean;
  eligible_collection_discount: boolean;
  allow_coupon: boolean;
  excluded_free_gift: boolean;
  contains_alcohol: boolean;
  contains_tobacco: boolean;
  food_type: string;
  offer: string;
  barcode: string;
  calories: string;
  serving_size: string;
  store_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  pivot: ItemPivot;
  modifier_groups: ModifierGroup[];
  allergens: Allergen[];
  categories: Category[];
  stock: number;
  default_quantity: number;
  default_discount: number;
  default_discount_type: string;
  available_for_delivery: boolean;
  available_for_pickup: boolean;
  schedule: ScheduleState["schedule"];
  schedule_config: ScheduleState["schedule_config"];
  unit: string;
}

// ------------------- Allergen & Pivot -------------------

interface AllergenPivot {
  item_id: number;
  allergen_id: number;
}

interface Allergen {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  pivot: AllergenPivot;
}

interface ItemPivot {
  category_id: number;
  item_id: number;
  id: number;
  created_at: string | null;
  updated_at: string | null;
}
