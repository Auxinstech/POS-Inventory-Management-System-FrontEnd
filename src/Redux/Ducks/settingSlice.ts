import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { produce } from "immer";
import { DeliveryConfiguration } from "Models/deliveryConfiguration";

interface ISetting {
  setting_loaded: boolean;
  delivery_configuration: DeliveryConfiguration[];
  settings: Array<SettingObject>;
}

export interface ITestMqtt {
  message: string | null;
  store_id: number;
}

export interface SettingObject {
  key: string;
  value: string;
  status: string;
  store_id: number;
  user_id: number;
}

const InitialState: ISetting = {
  setting_loaded: false,
  delivery_configuration: [],
  settings: [],
};

const SettingSlice = createSlice({
  name: "setting",
  initialState: InitialState,
  reducers: {
    getStoreSettings(state, action: PayloadAction<number>) {},
    setStoreSettings(state, action: PayloadAction<ISetting>) {
      return produce(state, (draftState) => {
        draftState.setting_loaded = action.payload.setting_loaded;
        draftState.delivery_configuration =
          action.payload.delivery_configuration;
        draftState.settings = action.payload.settings;
      });
    },
    // In your reducer - remove the immediate updates
    saveDeliveryConfiguration(
      state,
      action: PayloadAction<DeliveryConfiguration>,
    ) {
      // Don't update here - wait for saga
      return state;
    },
    updateDeliveryConfiguration(
      state,
      action: PayloadAction<DeliveryConfiguration>,
    ) {
      // Don't update here - wait for saga
      return state;
    },

    // Add these actions for successful operations
    saveDeliveryConfigurationSuccess(
      state,
      action: PayloadAction<DeliveryConfiguration>,
    ) {
      return produce(state, (draftState) => {
        draftState.delivery_configuration.push(action.payload);
      });
    },
    updateDeliveryConfigurationSuccess(
      state,
      action: PayloadAction<DeliveryConfiguration>,
    ) {
      return produce(state, (draftState) => {
        const idx = draftState.delivery_configuration.findIndex(
          (x) => x.id.toString() == action.payload.id.toString(),
        );
        if (idx !== -1) {
          draftState.delivery_configuration[idx] = action.payload;
        }
      });
    },
    deleteDeliveryConfiguration(state, action: PayloadAction<string>) {
      return state;
    },
    deleteDeliveryConfigurationSuccess(state, action: PayloadAction<string>) {
      return produce(state, (draftState) => {
        const idx = draftState.delivery_configuration.findIndex(
          (x) => x.id.toString() == action.payload,
        );
        if (idx !== -1) {
          draftState.delivery_configuration.splice(idx, 1);
        }
      });
    },
    changeSetting(state, action: PayloadAction<SettingObject>) {
      return produce(state, (draftState) => {});
    },
    TestMqtt(state, action: PayloadAction<ITestMqtt>) {},
  },
});

export const {
  getStoreSettings,
  setStoreSettings,
  saveDeliveryConfiguration,
  updateDeliveryConfiguration,
  saveDeliveryConfigurationSuccess,
  updateDeliveryConfigurationSuccess,
  deleteDeliveryConfigurationSuccess,
  deleteDeliveryConfiguration,
  changeSetting,
  TestMqtt,
} = SettingSlice.actions;

export default SettingSlice.reducer;
