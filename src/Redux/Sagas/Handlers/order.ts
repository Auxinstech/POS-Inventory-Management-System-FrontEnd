import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, select } from "redux-saga/effects";
import { setStoreSettings } from "../../Ducks/settingSlice";
import { toggleLoader } from "../../Ducks/loaderSlice";
import { setToast } from "../../Ducks/toastSlice";
import {
  requestDeleteDeliveryConfiguration,
  requestGetDeliveryConfiguration,
  requestSaveDeliveryConfiguration,
  requestUpdateDeliveryConfiguration,
} from "../Requests/setting";
import { DeliveryConfiguration } from "Models/deliveryConfiguration";
import {
  requestAssignRider,
  requestGetOrders,
  requestGetOrdersByID,
  requestGetReportOrders,
  requestPrintOrder,
  requestRemoveOrder,
  requestUpdateOrderStatus,
} from "../Requests/order";
import {
  setOrders,
  setOrdersById,
  setOrdersReport,
  setPrintUrl,
  setRemoveOrder,
} from "../../Ducks/orderSlice";
import { debug } from "console";
import { RootState } from "Redux/configureStore";
import { act } from "react";

export function* handleGetOrders({
  payload,
}: PayloadAction<{ store_id: number; day: string }>): any {
  try {
    yield put(toggleLoader(true));
    const { store_id, day } = payload;
    // const store_id = yield select(
    //   (state: RootState) => state.Home.selected_store
    // );
    if (!store_id) return; // Ensure it's set

    const res = yield call(requestGetOrders, store_id, day);

    yield put(setOrders(res.data));
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" })
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleGetReportOrders({
  payload,
}: PayloadAction<{ store_id: number; day: string }>): any {
  try {
    yield put(toggleLoader(true));
    const { store_id, day } = payload;
    // const store_id = yield select(
    //   (state: RootState) => state.Home.selected_store
    // );
    if (!store_id) return; // Ensure it's set

    const res = yield call(requestGetReportOrders, store_id, day);

    yield put(setOrdersReport(res.data.orders));
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" })
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleGetOrdersByID(action: PayloadAction<any>): any {
  try {
    yield put(toggleLoader(true));
    const data = action.payload;
    if (data && !data?.store_id) return; // Ensure it's set
    console.log(data);

    const res = yield call(requestGetOrdersByID, action.payload);

    yield put(setOrdersById(res.data));
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" })
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleRemoveOrder({
  payload,
  meta,
}: PayloadAction<number, string, { onSuccess: () => void } | undefined>): any {
  try {
    yield put(toggleLoader(true));
    const store_id = yield select(
      (state: RootState) => state.Home.selected_store
    );
    if (!store_id) return; // Ensure it's set

    const res = yield call(requestRemoveOrder, payload);

    // Update state after API success
    yield put(setRemoveOrder(payload));

    // Show success toast
    yield put(
      setToast({ message: "Order removed successfully", type: "success" })
    );

    // Call onSuccess callback if provided
    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(
      setToast({ message: error.response.data.message, type: "error" })
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

// export function* handleUpdateOrderStatus({
//   payload,
// }: PayloadAction<string>): any {
//   try {
//     yield put(toggleLoader(true));
//     const active_order = yield select(
//       (state: RootState) => state.Order.active_order
//     );
//     const res = yield call(requestUpdateOrderStatus, active_order.id, {
//       payment_status: active_order.payment_status,
//       status: payload,
//       // comment: payload,
//     });
//   } catch (error: any) {
//     yield put(
//       setToast({ message: error.response.data.message, type: "error" })
//     );
//   } finally {
//     yield put(toggleLoader(false));
//   }
// }

export function* handleUpdateOrderStatus({
  payload,
}: PayloadAction<string>): any {
  try {
    yield put(toggleLoader(true));
    console.log("payload", payload);

    // Refund logic
    if (payload === "Refunded") {
      const active_order_refund = yield select(
        (state: RootState) => state.Order.active_order_refund
      );

      if (!active_order_refund) {
        yield put(
          setToast({ message: "No active order selected.", type: "error" })
        );
        return;
      }
      console.log("active_order_refund", active_order_refund);
      const res = yield call(requestUpdateOrderStatus, active_order_refund.id, {
        payment_status: payload,
        status: payload,
        is_refund: 1,
      });
      yield put(
        setToast({ message: "Order refunded successfully", type: "success" })
      );
      return res.data;
    }
    // Normal order status update
    const active_order = yield select(
      (state: RootState) => state.Order.active_order
    );

    if (!active_order) {
      yield put(
        setToast({ message: "No active order selected.", type: "error" })
      );
      return;
    }

    const res = yield call(requestUpdateOrderStatus, active_order.id, {
      payment_status: active_order.payment_status,
      status: payload,
    });
    return res.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update order";
    yield put(setToast({ message, type: "error" }));
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleAssignRider({
  payload,
}: PayloadAction<number | null>): any {
  try {
    yield put(toggleLoader(true));

    const active_order = yield select(
      (state: RootState) => state.Order.active_order
    );

    if (!active_order) {
      yield put(
        setToast({ message: "No active order selected.", type: "error" })
      );
      return;
    }

    const res = yield call(requestAssignRider, active_order.id, {
      rider_id: payload,
      status: payload === null ? "Ready" : "Assigned",
    });
    return res.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update order";
    yield put(setToast({ message, type: "error" }));
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handlePrintOrder({ payload }: PayloadAction<number>): any {
  try {
    yield put(toggleLoader(true));
    const res = yield call(requestPrintOrder, payload);
    // const pdfURL = res?.data;
    // if (!pdfURL) throw new Error("PDF URL not found");
    // yield put(setPrintUrl(pdfURL));
    yield put(setToast({ message: res.message[0], type: "success" }));

    // return pdfURL;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || "Something went wrong";
    yield put(setToast({ message: errorMessage, type: "error" }));
  } finally {
    yield put(toggleLoader(false));
  }
}
