// Sagas file (e.g., vendorsSaga.ts)
import { PayloadAction } from "@reduxjs/toolkit";
import { call, put } from "redux-saga/effects";
import { setToast } from "../../Ducks/toastSlice";
import {
  addVendor,
  createVendor,
  setVendorList,
  IVendorCreatePayload,
  IVendorsListParams,
} from "../../Ducks/vendorSlice";
import {
  requestCreateVendor,
  requestDeleteVendor,
  requestUpdateVendor,
  requestVendorsList,
} from "../Requests/vendor";
import { toggleLoader } from "../../Ducks/loaderSlice";

export function* handleFetchVendors(
  action: PayloadAction<IVendorsListParams | undefined>,
): any {
  try {
    yield put(toggleLoader(true));

    const params = action.payload || {};
    const res = yield call(requestVendorsList, params);
    const vendorsData = res.data;
    yield put(setVendorList(vendorsData));
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to load vendors",
        type: "error",
      }),
    );
  }
}

export function* handleCreateVendor({
  payload,
  meta,
}: PayloadAction<
  IVendorCreatePayload,
  string,
  { onSuccess?: () => void }
>): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestCreateVendor, payload);
    yield put(addVendor(res.data));

    yield put(
      setToast({ message: "Vendor created successfully", type: "success" }),
    );
    yield put(toggleLoader(false));

    if (meta?.onSuccess) {
      yield call(meta.onSuccess);
    }
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to create vendor",
        type: "error",
      }),
    );
  }
}

export function* handleUpdateVendor(
  action: PayloadAction<
    { id: number; data: Partial<IVendorCreatePayload> },
    string,
    { onSuccess?: (resData: any) => void }
  >,
): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestUpdateVendor, {
      id: action.payload.id,
      data: action.payload.data,
    });

    yield put(
      setToast({ message: "Vendor updated successfully", type: "success" }),
    );

    yield put(toggleLoader(false));

    if (action.meta?.onSuccess) {
      action.meta.onSuccess(res.data);
    }
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to update vendor",
        type: "error",
      }),
    );
  }
}

export function* handleDeleteVendor({
  payload,
  meta,
}: PayloadAction<number, string, { onSuccess?: () => void }>): any {
  try {
    yield put(toggleLoader(true));

    yield call(requestDeleteVendor, payload);
    yield put(
      setToast({
        message: "Vendor deleted successfully",
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
        message: error.response?.data?.message || "Failed to delete vendor",
        type: "error",
      }),
    );
  }
}
