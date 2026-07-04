import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, select } from "redux-saga/effects";
import {
  deleteDeliveryConfigurationSuccess,
  ITestMqtt,
  saveDeliveryConfigurationSuccess,
  setStoreSettings,
  SettingObject,
  updateDeliveryConfigurationSuccess,
} from "../../Ducks/settingSlice";
import { toggleLoader } from "../../Ducks/loaderSlice";
import { setToast } from "../../Ducks/toastSlice";
import {
  requestChangeSetting,
  requestDeleteDeliveryConfiguration,
  requestGetDeliveryConfiguration,
  requestGetSettings,
  requestSaveDeliveryConfiguration,
  requestTestMqtt,
  requestUpdateDeliveryConfiguration,
} from "../Requests/setting";
import { DeliveryConfiguration } from "Models/deliveryConfiguration";
import { RootState } from "Redux/configureStore";

export function* handleGetStoreSettings({
  payload,
}: PayloadAction<number>): any {
  try {
    yield put(toggleLoader(true));
    const delivery_configuration = yield call(
      requestGetDeliveryConfiguration,
      payload,
    );
    const settings = yield call(requestGetSettings, payload);

    yield put(
      setStoreSettings({
        setting_loaded: true,
        delivery_configuration: delivery_configuration.data,
        settings: settings.data,
      }),
    );
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleSaveDeliveryConfiguration({
  payload,
}: PayloadAction<DeliveryConfiguration>): any {
  try {
    yield put(toggleLoader(true));
    const response = yield call(requestSaveDeliveryConfiguration, payload);
    yield put(saveDeliveryConfigurationSuccess(response.data)); // Use response from API

    yield put(
      setToast({
        message: "Delivery configuration saved successfully",
        type: "success",
      }),
    );
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleUpdateDeliveryConfiguration({
  payload,
}: PayloadAction<DeliveryConfiguration>): any {
  try {
    debugger;
    yield put(toggleLoader(true));
    const response = yield call(requestUpdateDeliveryConfiguration, payload);
    yield put(updateDeliveryConfigurationSuccess(response.data)); // Use response from API
    yield put(
      setToast({
        message: "Delivery configuration updated successfully",
        type: "success",
      }),
    );
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleDeleteDeliveryConfiguration({
  payload,
}: PayloadAction<string>): any {
  try {
    yield put(toggleLoader(true));
    yield call(requestDeleteDeliveryConfiguration, payload);
    yield put(deleteDeliveryConfigurationSuccess(payload));

    yield put(
      setToast({
        message: "Delivery configuration deleted successfully",
        type: "success",
      }),
    );
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleChangeSetting({
  payload,
}: PayloadAction<SettingObject>): any {
  try {
    yield put(toggleLoader(true));
    let store_id = yield select(
      (state: RootState) => state.Home.selected_store,
    );
    let user_id = yield select((state: RootState) => state.User.user.id);
    let model: SettingObject = {
      ...payload,
      store_id,
      user_id,
    };

    yield call(requestChangeSetting, model);
    yield put(
      setToast({ message: "Setting Saved Successfully", type: "success" }),
    );
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleTestMqtt({ payload }: PayloadAction<ITestMqtt>): any {
  try {
    yield put(toggleLoader(true));
    yield call(requestTestMqtt, payload);
    // yield put(
    //   setToast({ message: "Request sent successfully", type: "success" })
    // );
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" }),
    );
  } finally {
    yield put(toggleLoader(false));
  }
}
