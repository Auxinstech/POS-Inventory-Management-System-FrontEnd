import { Modifier } from "./modifier";

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

export interface CreateModifierGroupRequest {
  name: string;
  description: string;
  min: number;
  max: number;
  is_required: boolean;
  half_and_half: boolean;
  is_multi_selection: boolean;
  allow_custom_selection: boolean;
  store_id: number;
  items?: number[];
  schedule: ScheduleState["schedule"];
  schedule_config: ScheduleState["schedule_config"];
  available_for_delivery: boolean;
  available_for_pickup: boolean;
}

export interface UpdateModifierGroupRequest extends CreateModifierGroupRequest {
  id: number;
}

export interface UpdateModifierGroupSortRequest {
  item_id: number;
  modifier_group_id: number;
  sort: number;
  id: number;
}

export interface ModifierGroup {
  id: number;
  name: string;
  description: string;
  sort: number;
  min: number;
  max: number;
  is_required: boolean;
  half_and_half: boolean;
  is_multi_selection: boolean;
  store_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  modifiers: Modifier[];
  allow_custom_selection: boolean;
  pivot: {
    item_id: number;
    modifier_group_id: number;
    sort: number;
    id: number;
  };
  schedule: ScheduleState["schedule"];
  schedule_config: ScheduleState["schedule_config"];
  available_for_delivery: boolean;
  available_for_pickup: boolean;
}
