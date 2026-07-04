import {
  CreateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryRequest,
} from "Models/category";
import { IDiscountCreatePayload, IDiscountsListParams } from "Models/discounts";
import { CreateItemRequest, UpdateItemRequest } from "Models/item";
import { CreateModifierRequest, UpdateModifierRequest } from "Models/modifier";
import {
  CreateModifierGroupRequest,
  UpdateModifierGroupRequest,
  UpdateModifierGroupSortRequest,
} from "Models/modifierGroup";
import { Booking } from "Redux/Ducks/homeSlice";
import { get, post, put, remove } from "Utils/axios";

export function requestGetStores(): any {
  return get("stores");
}

let categoriesController: AbortController | null = null;

export const requestGetCategories = (storeId: number) => {
  if (!storeId) return;
  // cancel previous request if still running
  if (categoriesController) {
    categoriesController.abort();
  }

  categoriesController = new AbortController();

  return get(`categories?store_id=${storeId}`, {
    signal: categoriesController.signal,
  });
};
// export function requestGetCategories(id: number): any {
//   return get(`categories?store_id=${id}`);
// }

export function requestGetCategory(id: number): any {
  return get(`categories/${id}`);
}

export function requestSaveCategory(model: CreateCategoryRequest): any {
  return post("categories", model);
}

export function requestUpdateCategory(model: UpdateCategoryRequest): any {
  return put(`categories/${model.id}`, model);
}

export function requestDeleteCategory(id: number): any {
  return remove(`categories/${id}`);
}

export function requestSaveBooking(model: Booking): any {
  return post("bookings", model);
}

export function requestUpdateBooking(id: number, model: Booking): any {
  return put(`bookings/${id}`, model);
}

export function requestSaveItem(model: CreateItemRequest): any {
  return post("items", model);
}

export function requestUpdateItem(model: UpdateItemRequest): any {
  return put(`items/${model.id}`, model);
}

export function requestDeleteItem(id: number): any {
  return remove(`items/${id}`);
}

export function requestSaveModifierGroup(
  model: CreateModifierGroupRequest,
): any {
  return post("modifier-groups", model);
}

export function requestUpdateModifierGroup(
  model: UpdateModifierGroupRequest,
): any {
  return put(`modifier-groups/${model.id}`, model);
}

export function requestDeleteModifierGroup(id: number): any {
  return remove(`modifier-groups/${id}`);
}

export function requestUnlinkModifierGroup(data: any): any {
  return post(`modifier-groups/unlink`, data);
}

export function requestLinkModifierGroup(data: any): any {
  return post(`modifier-groups/link`, data);
}

export function requestGetModifierGroups(store_id: number): any {
  return get(`modifier-groups?store_id=${store_id}`);
}

export function requestGetModifierGroup(id: number): any {
  return get(`modifier-groups/${id}`);
}

export function requestGetModifiers(store_id: number): any {
  return get(`modifiers?store_id=${store_id}`);
}

export function requestGetModifier(id: number): any {
  return get(`modifiers/${id}`);
}

export function requestSaveModifier(model: CreateModifierRequest): any {
  return post("modifiers", model);
}

export function requestUpdateModifier(model: UpdateModifierRequest): any {
  return put(`modifiers/${model.id}`, model);
}
export function requestUpdateModifierGroupSort(
  model: UpdateModifierGroupSortRequest,
): any {
  return post(`modifier-groups/sort`, {
    ...model,
  });
}

export function requestDeleteModifier(id: number): any {
  return remove(`modifiers/${id}`);
}

export function requestGetItem(id: number): any {
  return get(`items/${id}`);
}

export function requestGetItems(store_id: number): any {
  return get(`items?store_id=${store_id}`);
}

export function requestTestPrinter(store_id: number): any {
  return get(`test-printer/${store_id}`);
}

export function requestPhoneNumberDetails(phone_number: string): any {
  return get(`fetch-address-by-phone?phone=${phone_number}`);
}

// ==================== DISCOUNT API REQUESTS ====================

export const requestDiscountsList = (params?: IDiscountsListParams) => {
  return get("/discounts", { params });
};

export const requestCreateDiscount = (data: IDiscountCreatePayload) => {
  return post("/discounts", data);
};

export const requestUpdateDiscount = ({
  id,
  data,
}: {
  id: number;
  data: Partial<IDiscountCreatePayload>;
}) => {
  return put(`/discounts/${id}`, data);
};

export const requestDeleteDiscount = (id: number) => {
  return remove(`/discounts/${id}`);
};
