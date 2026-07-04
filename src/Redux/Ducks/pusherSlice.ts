import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OrderEventPayload {
  order_id: number;
  store_id: number;
  message: string;
}

export interface PusherState {
  OrderCreated: OrderEventPayload | null;
  OrderUpdated: OrderEventPayload | null;
  TestMqttMessage: string | null;
  mqttStatus: boolean;
}

export const initialState: PusherState = {
  OrderCreated: null,
  OrderUpdated: null,
  TestMqttMessage: null,
  mqttStatus: false,
};

const pusherSlice = createSlice({
  name: "pusher",
  initialState,
  reducers: {
    isOrderCreated(state, action: PayloadAction<OrderEventPayload>) {
      state.OrderCreated = action.payload;
    },
    isOrderUpdated(state, action: PayloadAction<OrderEventPayload>) {
      state.OrderUpdated = action.payload;
    },
    setTestMqtt(state, action: PayloadAction<string>) {
      state.TestMqttMessage = action.payload;
    },
    removeTestMqtt(state) {
      state.TestMqttMessage = null;
    },
    clearPuserState(state) {
      state.OrderCreated = null;
      state.OrderUpdated = null;
    },
    setMqttStatus(state, action: PayloadAction<boolean>) {
      state.mqttStatus = action.payload;
    },
  },
});

export const {
  isOrderCreated,
  isOrderUpdated,
  clearPuserState,
  setTestMqtt,
  removeTestMqtt,
  setMqttStatus,
} = pusherSlice.actions;
export default pusherSlice.reducer;
