// export function* handleLoginUser({ payload }: PayloadAction<any>): any {
//   try {

import { PayloadAction } from "@reduxjs/toolkit";
import { call, put } from "redux-saga/effects";
import { setToast } from "../../Ducks/toastSlice";
import { setUserLoginData } from "../../Ducks/userSlice";
import { push } from "redux-first-history";
import { setActiveStore, setTokens } from "Utils/auth";
import storage from "Utils/storage";
import { requestLogin, requestVerifyOtpToken } from "../Requests/user";
import { requestPermissionsList } from "../Requests/rolesPermission";

//     // yield put(toggleLoader(true));

//     // const response = yield requestUserLogin({ password: payload.password, clientno: payload.clientno, username: payload.username, languageno: payload.languageno });
//     // const data = response;

//     // yield put(setUserObject({ user: data.UserInfo, defaultPage: data.UserInfo.defaultPage, languageno: payload.languageno }));

//     // setTokens({ RefreshToken: data.RefreshToken, AccessToken: data.AccessToken });

//     // const redirectTo = payload.redirectUrl || data.UserInfo.defaultPage;

//     // yield put(push(redirectTo));

//   } catch (error: any) {
//     // yield put(setGlobalMessage({ error }));
//   }
//   finally {
//     yield put(toggleLoader(false));
//   }
// }

export function* handleLoginUser({
  payload,
}: PayloadAction<{ email: string }>): any {
  try {
    const res = yield call(requestLogin, payload);
    yield put(setToast({ message: res.message[0], type: "success" }));
    yield put(push(`/verify?email=${payload.email}`));
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" })
    );
  }
}

export function* handleVerifyUser({
  payload,
}: PayloadAction<{ email: string; otp: string }>): any {
  try {
    const res = yield call(requestVerifyOtpToken, payload);
    yield put(setToast({ message: res.message[0], type: "success" }));
    yield put(setUserLoginData({ user: res.data[0], token: res.data[1] }));
    setTokens({ AccessToken: res.data[1] });
    storage.set("UserID", res.data[0].id);
    storage.set("roles", res.data[0].roles);
    storage.set("stores", res.data[0].stores);
    storage.set("email", res.data[0].email);
    storage.set("name", res.data[0].name);
    const getPermissionList = yield call(requestPermissionsList);
    yield put(push("/"));
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" })
    );
  }
}

export function* handleLogOutUser(): any {
  try {
    storage.clear();
    yield put(push("/login"));
  } catch (error: any) {
    // yield put(setToast({ message: error.message, type: 'error' }));
  }
}

export {};
