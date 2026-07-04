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

export interface CreateModifierRequest {
  modifier_group_id: number;
  name: string;
  vat_percent: number;
  price: number;
  allow_multiple: boolean;
  next_modifier_group_id: number;
  min: number;
  max: number;
  is_active: boolean;
  store_id: number;
  availability: string;
  contains_alcohol: boolean;
  contains_tobacco: boolean;
  schedule: ScheduleState["schedule"];
  schedule_config: ScheduleState["schedule_config"];
  available_for_delivery: boolean;
  available_for_pickup: boolean;
}

export interface UpdateModifierRequest extends CreateModifierRequest {
  id: number;
}

export interface Modifier {
  id: number;
  modifier_group_id: number;
  name: string;
  vat_percent: number;
  price: number;
  sort: number;
  allow_multiple: boolean;
  min: number;
  max: number;
  availability: string;
  next_modifier_group_id: number;
  is_active: boolean;
  store_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  contains_alcohol: boolean;
  contains_tobacco: boolean;
  schedule: ScheduleState["schedule"];
  schedule_config: ScheduleState["schedule_config"];
  available_for_delivery: boolean;
  available_for_pickup: boolean;
}
