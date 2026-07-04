import { PayloadAction } from "@reduxjs/toolkit";
import { call, put } from "redux-saga/effects";
import { setToast } from "../../Ducks/toastSlice";
import { addUser, createUser, setUserList } from "../../Ducks/UsersSlice";
import {
  requestCreateUser,
  requestDeleteUser,
  requestUpdateUser,
  requestUsersList,
} from "../Requests/users";
import { toggleLoader } from "../../Ducks/loaderSlice";
import { IUserCreatePayload } from "../../Ducks/UsersSlice";
import storage from "Utils/storage";

export function* handleFetchUsers(): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestUsersList);
    const users = res.data;
    yield put(setUserList(users));
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to load users",
        type: "error",
      })
    );
  }
}

export function* handleCreateUsers({
  payload,
  meta,
}: PayloadAction<IUserCreatePayload, string, { onSuccess?: () => void }>): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestCreateUser, payload);
    yield put(addUser(res.data));

    yield put(
      setToast({ message: "User created successfully", type: "success" })
    );
    yield put(toggleLoader(false));

    if (meta?.onSuccess) {
      yield call(meta.onSuccess);
    }
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to create users",
        type: "error",
      })
    );
  }
}

export function* handleUpdateUser(
  action: PayloadAction<
    { id: number; data: IUserCreatePayload },
    string,
    { onSuccess?: (resData: any) => void }
  >
): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestUpdateUser, {
      id: action.payload.id,
      data: action.payload.data,
    });

    yield put(
      setToast({ message: "User updated successfully", type: "success" })
    );

    yield put(toggleLoader(false));

    if (action.meta?.onSuccess) {
      action.meta.onSuccess(res.data);
    }
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to update user",
        type: "error",
      })
    );
  }
}

export function* handleDeleteUser({
  payload,
  meta,
}: PayloadAction<number, string, { onSuccess?: () => void }>): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestDeleteUser, payload);
    yield put(
      setToast({
        message: "User deleted successfully",
        type: "success",
      })
    );
    yield put(toggleLoader(false));

    if (meta?.onSuccess) {
      yield call(meta.onSuccess);
    }
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to delete user",
        type: "error",
      })
    );
  }
}
