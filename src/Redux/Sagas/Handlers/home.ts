import { PayloadAction } from "@reduxjs/toolkit";
import { CreateCategoryRequest, UpdateCategoryRequest } from "Models/category";
import { CreateItemRequest, UpdateItemRequest } from "Models/item";
import {
  CreateModifierGroupRequest,
  ModifierGroup,
  UpdateModifierGroupRequest,
  UpdateModifierGroupSortRequest,
} from "Models/modifierGroup";
import { call, debounce, put, select } from "redux-saga/effects";
import { RootState } from "Redux/configureStore";
import {
  addCategory,
  addDiscount,
  addItem,
  addModifier,
  addModifierGroup,
  Booking,
  removeDiscount,
  setCategories,
  setDiscountList,
  setStores,
  updateDiscountInState,
} from "../../Ducks/homeSlice";
import { toggleLoader } from "../../Ducks/loaderSlice";
import { setToast } from "../../Ducks/toastSlice";
import {
  requestCreateDiscount,
  requestDeleteCategory,
  requestDeleteDiscount,
  requestDeleteItem,
  requestDeleteModifier,
  requestDeleteModifierGroup,
  requestDiscountsList,
  requestGetCategories,
  requestGetStores,
  requestLinkModifierGroup,
  requestSaveBooking,
  requestSaveCategory,
  requestSaveItem,
  requestSaveModifier,
  requestSaveModifierGroup,
  requestUnlinkModifierGroup,
  requestUpdateBooking,
  requestUpdateCategory,
  requestUpdateDiscount,
  requestUpdateItem,
  requestUpdateModifier,
  requestUpdateModifierGroup,
  requestUpdateModifierGroupSort,
} from "../Requests/home";
import {
  CreateModifierRequest,
  Modifier,
  UpdateModifierRequest,
} from "Models/modifier";
import { setActiveOrder } from "../../Ducks/orderSlice";
import { IDiscountCreatePayload, IDiscountsListParams } from "Models/discounts";

export function* handleGetStores(): any {
  try {
    yield put(toggleLoader(true));
    const res = yield call(requestGetStores);
    yield put(setStores(res.data));
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  }
}

export function* handleGetCategories({ payload }: PayloadAction<number>): any {
  try {
    yield put(toggleLoader(true));
    const res: any = yield call(requestGetCategories, payload);
    yield put(setCategories(res.data));
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  }
}

export function* handleSaveCategory({
  payload,
  meta,
}: PayloadAction<
  CreateCategoryRequest,
  string,
  { onSuccess: () => void } | undefined
>): any {
  try {
    yield put(toggleLoader(true));
    const store_id = yield select(
      (state: RootState) => state.Home.selected_store,
    );
    const model = { ...payload, store_id };
    let res: any = yield call(requestSaveCategory, model);
    yield put(addCategory(res.data));

    const parent_id: number = res.data.id;
    res = yield call(requestSaveCategory, {
      ...res.data,
      parent_id,
      image: model.image,
    });
    yield put(addCategory(res.data));

    yield put(setToast({ message: res.message[0], type: "success" }));
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  }
}

export function* handleUpdateCategory({
  payload,
  meta,
}: PayloadAction<
  UpdateCategoryRequest,
  string,
  { onSuccess: () => void } | undefined
>): any {
  try {
    yield put(toggleLoader(true));
    const store_id = yield select(
      (state: RootState) => state.Home.selected_store,
    );
    const model = { ...payload, store_id };
    const res: any = yield call(requestUpdateCategory, model);

    yield put(setToast({ message: res.message[0], type: "success" }));
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  }
}

export function* handleRemoveCategory({
  payload,
  meta,
}: PayloadAction<number, string, { onSuccess: () => void } | undefined>): any {
  try {
    yield put(toggleLoader(true));
    yield call(requestDeleteCategory, payload);
    yield put(
      setToast({ message: "Category deleted successfully", type: "success" }),
    );
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  }
}

// SAVE Item
export function* handleSaveItem({
  payload,
  meta,
}: PayloadAction<
  CreateItemRequest,
  string,
  { onSuccess: () => void } | undefined
>): any {
  try {
    yield put(toggleLoader(true));
    const store_id = yield select(
      (state: RootState) => state.Home.selected_store,
    );
    const model = { ...payload, store_id };
    const res: any = yield call(requestSaveItem, model);
    yield put(addItem(res.data));
    yield put(setToast({ message: res.message[0], type: "success" }));
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  }
}

// UPDATE Item
export function* handleUpdateItem({
  payload,
  meta,
}: PayloadAction<
  UpdateItemRequest,
  string,
  { onSuccess: () => void } | undefined
>): any {
  try {
    yield put(toggleLoader(true));
    const store_id = yield select(
      (state: RootState) => state.Home.selected_store,
    );
    const model = { ...payload, store_id };
    const res: any = yield call(requestUpdateItem, model);
    yield put(setToast({ message: res.message[0], type: "success" }));
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  }
}

// DELETE Item
export function* handleRemoveItem({
  payload,
  meta,
}: PayloadAction<number, string, { onSuccess: () => void } | undefined>): any {
  try {
    yield put(toggleLoader(true));
    yield call(requestDeleteItem, payload);
    yield put(
      setToast({ message: "Item deleted successfully", type: "success" }),
    );
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  }
}

export function* handleSaveModifierGroup({
  payload,
  meta,
}: PayloadAction<
  CreateModifierGroupRequest,
  string,
  { onSuccess?: (data: ModifierGroup) => void } | undefined
>): any {
  try {
    yield put(toggleLoader(true));
    const store_id = yield select(
      (state: RootState) => state.Home.selected_store,
    );
    const model = { ...payload, store_id };
    const res: any = yield call(requestSaveModifierGroup, model);
    if (payload.items && payload.items.length > 0) {
      yield put(addModifierGroup(res.data, payload.items));
    }
    yield put(setToast({ message: res.message[0], type: "success" }));
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess, res.data);
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message ?? "Failed to save",
        type: "error",
      }),
    );
  }
}

export function* handleUpdateModifierGroup({
  payload,
  meta,
}: PayloadAction<
  { modifierGroup: UpdateModifierGroupRequest; items: number[] },
  string,
  { onSuccess?: (data: ModifierGroup) => void } | undefined
>): any {
  try {
    yield put(toggleLoader(true));
    const res: any = yield call(
      requestUpdateModifierGroup,
      payload.modifierGroup,
    );

    yield put(setToast({ message: res.message[0], type: "success" }));
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess, res.data);
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message ?? "Update failed",
        type: "error",
      }),
    );
  }
}

export function* handleRemoveModifierGroup({
  payload,
  meta,
}: PayloadAction<number, string, { onSuccess?: () => void } | undefined>): any {
  try {
    yield put(toggleLoader(true));
    yield call(requestDeleteModifierGroup, payload);
    yield put(
      setToast({
        message: "Modifier group deleted successfully",
        type: "success",
      }),
    );
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message ?? "Deletion failed",
        type: "error",
      }),
    );
    yield put(toggleLoader(false));
  }
}

export function* handleLinkModifierGroup({
  payload,
  meta,
}: PayloadAction<
  {
    item_id: number;
    modifier_group_id: number;
    onSuccess?: () => void;
  },
  string,
  { onSuccess?: () => void } | undefined
>): any {
  try {
    yield put(toggleLoader(true));
    yield call(requestLinkModifierGroup, payload);
    yield put(
      setToast({
        message: "Modifier group linked successfully",
        type: "success",
      }),
    );
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message ?? "Deletion failed",
        type: "error",
      }),
    );
    yield put(toggleLoader(false));
  }
}
export function* handleUnlinkModifierGroup({
  payload,
  meta,
}: PayloadAction<
  {
    item_id: number;
    modifier_group_id: number;
    onSuccess?: () => void;
  },
  string,
  { onSuccess?: () => void } | undefined
>): any {
  try {
    yield put(toggleLoader(true));
    yield call(requestUnlinkModifierGroup, payload);
    yield put(
      setToast({
        message: "Modifier group deleted successfully",
        type: "success",
      }),
    );
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message ?? "Deletion failed",
        type: "error",
      }),
    );
    yield put(toggleLoader(false));
  }
}

export function* handleSaveModifier({
  payload,
  meta,
}: PayloadAction<
  CreateModifierRequest,
  string,
  { onSuccess?: (data: Modifier) => void } | undefined
>): any {
  try {
    yield put(toggleLoader(true));
    const store_id = yield select(
      (state: RootState) => state.Home.selected_store,
    );
    const model = { ...payload, store_id };
    const res: any = yield call(requestSaveModifier, model);

    yield put(addModifier(res.data));
    yield put(setToast({ message: res.message[0], type: "success" }));
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess, res.data);
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message ?? "Failed to save modifier",
        type: "error",
      }),
    );
  }
}

export function* handleUpdateModifier({
  payload,
  meta,
}: PayloadAction<
  UpdateModifierRequest,
  string,
  { onSuccess?: (data: Modifier) => void } | undefined
>): any {
  try {
    yield put(toggleLoader(true));
    const res: any = yield call(requestUpdateModifier, payload);
    yield put(setToast({ message: res.message[0], type: "success" }));
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess, res.data);
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message ?? "Update failed",
        type: "error",
      }),
    );
  }
}

export function* handleUpdateModifierGroupSort({
  payload,
  meta,
}: PayloadAction<
  UpdateModifierGroupSortRequest,
  string,
  { onSuccess?: (data: Modifier) => void } | undefined
>): any {
  try {
    yield put(toggleLoader(true));
    const res: any = yield call(requestUpdateModifierGroupSort, payload);
    yield put(setToast({ message: res.message[0], type: "success" }));
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess, res.data);
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message ?? "Update failed",
        type: "error",
      }),
    );
  }
}

export function* handleRemoveModifier({
  payload,
  meta,
}: PayloadAction<number, string, { onSuccess?: () => void } | undefined>): any {
  try {
    yield put(toggleLoader(true));
    yield call(requestDeleteModifier, payload);
    yield put(
      setToast({ message: "Modifier deleted successfully", type: "success" }),
    );
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message ?? "Deletion failed",
        type: "error",
      }),
    );
  }
}

export function* handleSaveBooking({
  payload,
  meta,
}: PayloadAction<Booking, string, { onSuccess: () => void } | undefined>): any {
  try {
    yield put(toggleLoader(true));
    // let model = {
    //   ...payload,
    //   store_id: yield select((state: RootState) => state.Home.selected_store),
    // };
    let model = {
      ...payload,
      header: {
        ...payload.header,
        store_id: yield select((state: RootState) => state.Home.selected_store),
      },
    };
    const res = yield call(requestSaveBooking, model);
    yield put(setToast({ message: res.message[0], type: "success" }));
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
    yield put(toggleLoader(false));
  }
}

export function* handleUpdateBooking({
  payload,
  meta,
}: PayloadAction<Booking, string, { onSuccess: () => void } | undefined>): any {
  try {
    yield put(toggleLoader(true));
    // let model = {
    //   ...payload,
    //   store_id: yield select((state: RootState) => state.Home.selected_store),
    // };
    let model = {
      ...payload,
      header: {
        ...payload.header,
        store_id: yield select((state: RootState) => state.Home.selected_store),
        status: "Pending",
      },
    };
    let orderID = yield select(
      (state: RootState) => state.Order.EditOrderItemID,
    );

    const res = yield call(requestUpdateBooking, orderID, model);
    yield put(setActiveOrder(res.data));
    yield put(setToast({ message: res.message[0], type: "success" }));
    yield put(toggleLoader(false));

    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
    yield put(toggleLoader(false));
  }
}

// ==================== DISCOUNT SAGA HANDLERS ====================

export function* handleFetchDiscounts(
  action: PayloadAction<IDiscountsListParams | undefined>,
): any {
  try {
    yield put(toggleLoader(true));

    const params = action.payload || {};
    const res = yield call(requestDiscountsList, params);
    const discountsData = res.data; // Note: response is wrapped in data.data
    yield put(setDiscountList(discountsData));
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to load discounts",
        type: "error",
      }),
    );
  }
}

export function* handleCreateDiscount({
  payload,
  meta,
}: PayloadAction<
  IDiscountCreatePayload,
  string,
  { onSuccess?: () => void }
>): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestCreateDiscount, payload);
    yield put(addDiscount(res.data)); // Extract the created discount from response

    yield put(
      setToast({ message: "Discount created successfully", type: "success" }),
    );
    yield put(toggleLoader(false));

    if (meta?.onSuccess) {
      yield call(meta.onSuccess);
    }
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to create discount",
        type: "error",
      }),
    );
  }
}

export function* handleUpdateDiscount(
  action: PayloadAction<
    { id: number; data: Partial<IDiscountCreatePayload> },
    string,
    { onSuccess?: (resData: any) => void }
  >,
): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestUpdateDiscount, {
      id: action.payload.id,
      data: action.payload.data,
    });

    yield put(
      updateDiscountInState({
        id: action.payload.id,
        data: action.payload.data,
      }),
    );

    yield put(
      setToast({ message: "Discount updated successfully", type: "success" }),
    );

    yield put(toggleLoader(false));

    if (action.meta?.onSuccess) {
      action.meta.onSuccess(res.data);
    }
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to update discount",
        type: "error",
      }),
    );
  }
}

export function* handleDeleteDiscount({
  payload,
  meta,
}: PayloadAction<number, string, { onSuccess?: () => void }>): any {
  try {
    yield put(toggleLoader(true));

    yield call(requestDeleteDiscount, payload);
    yield put(removeDiscount(payload));
    yield put(
      setToast({
        message: "Discount deleted successfully",
        type: "success",
      }),
    );
    yield put(toggleLoader(false));

    if (meta?.onSuccess) {
      yield call(meta.onSuccess);
    }
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to delete discount",
        type: "error",
      }),
    );
  }
}
