import { PayloadAction } from "@reduxjs/toolkit";
import { call, put } from "redux-saga/effects";
import { setToast } from "../../Ducks/toastSlice";
import {
  addCustomer,
  createCustomer,
  setCustomerList,
  ICustomerCreatePayload,
  ICustomersListParams,
} from "../../Ducks/customerSlice";
import {
  requestCreateCustomer,
  requestDeleteCustomer,
  requestUpdateCustomer,
  requestCustomersList,
} from "../Requests/customers";
import { toggleLoader } from "../../Ducks/loaderSlice";

export function* handleFetchCustomers(
  action: PayloadAction<ICustomersListParams | undefined>,
): any {
  try {
    yield put(toggleLoader(true));

    const params = action.payload || {};
    const res = yield call(requestCustomersList, params);
    const customersData = res.data;
    yield put(setCustomerList(customersData));
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to load customers",
        type: "error",
      }),
    );
  }
}

export function* handleCreateCustomer({
  payload,
  meta,
}: PayloadAction<
  ICustomerCreatePayload,
  string,
  { onSuccess?: () => void }
>): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestCreateCustomer, payload);
    yield put(addCustomer(res.data));

    yield put(
      setToast({ message: "Customer created successfully", type: "success" }),
    );
    yield put(toggleLoader(false));

    if (meta?.onSuccess) {
      yield call(meta.onSuccess);
    }
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to create customer",
        type: "error",
      }),
    );
  }
}

export function* handleUpdateCustomer(
  action: PayloadAction<
    { id: number; data: Partial<ICustomerCreatePayload> },
    string,
    { onSuccess?: (resData: any) => void }
  >,
): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestUpdateCustomer, {
      id: action.payload.id,
      data: action.payload.data,
    });

    yield put(
      setToast({ message: "Customer updated successfully", type: "success" }),
    );

    yield put(toggleLoader(false));

    if (action.meta?.onSuccess) {
      action.meta.onSuccess(res.data);
    }
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to update customer",
        type: "error",
      }),
    );
  }
}

export function* handleDeleteCustomer({
  payload,
  meta,
}: PayloadAction<number, string, { onSuccess?: () => void }>): any {
  try {
    yield put(toggleLoader(true));

    yield call(requestDeleteCustomer, payload);
    yield put(
      setToast({
        message: "Customer deleted successfully",
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
        message: error.response?.data?.message || "Failed to delete customer",
        type: "error",
      }),
    );
  }
}
