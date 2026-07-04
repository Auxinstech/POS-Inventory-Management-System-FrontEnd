import { PayloadAction } from "@reduxjs/toolkit";
import { call, put } from "redux-saga/effects";
import { setToast } from "../../Ducks/toastSlice";

import { toggleLoader } from "../../Ducks/loaderSlice";
import {
  requestDetailedReport,
  requestGenerateInvoice,
  requestInventoryTranscations,
  requestInventoryTranscationsAdd,
  requestInventoryTranscationsDelete,
  requestInvoiceSummaryList,
  requestMarkInvoicePaid,
  requestReportsList,
  requestStripeReport,
} from "../Requests/report";
import {
  FetchDetailedReportPayload,
  FetchReportPayload,
  FetchStripeReportPayload,
  InventoryTranscationsPayload,
  InvoiceSummaryPayload,
  setDetailedReport,
  setInventoryTranscations,
  setInvoiceSummaryList,
  setReportsList,
  setStripeReport,
  updateInventoryTranscations,
} from "../../Ducks/reportSlice";

export function* handleFetcReports(
  action: PayloadAction<FetchReportPayload>,
): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestReportsList, action.payload);
    const reports = res.data;

    yield put(setReportsList(reports));
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to load reports",
        type: "error",
      }),
    );
  }
}

export function* handleMarkInvoicePaid(
  action: PayloadAction<{
    store_id: number;
    invoice_id: number;
  }>,
): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestMarkInvoicePaid, action.payload);

    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to load reports",
        type: "error",
      }),
    );
  }
}

export function* handleFetchInvoiceSummary(
  action: PayloadAction<InvoiceSummaryPayload>,
): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestInvoiceSummaryList, action.payload);
    const reports = res.data;

    yield put(setInvoiceSummaryList(reports));
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to load reports",
        type: "error",
      }),
    );
  }
}

export function* handleFetchDetailedReport(
  action: PayloadAction<FetchDetailedReportPayload>,
): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestDetailedReport, action.payload);
    const reports = res.data;

    yield put(setDetailedReport(reports));
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to load reports",
        type: "error",
      }),
    );
  }
}

export function* handleFetchInventoryTranscations(
  action: PayloadAction<any>,
): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestInventoryTranscations, action.payload);
    const reports = res.data;

    yield put(setInventoryTranscations(reports));
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to load reports",
        type: "error",
      }),
    );
  }
}

export function* handleDeleteInventoryTranscations(
  action: PayloadAction<any>,
): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestInventoryTranscationsDelete, action.payload);
    const reports = res.data;

    yield put(
      updateInventoryTranscations({
        id: action.payload,
        type: "delete",
        data: null,
      }),
    );
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to delete record",
        type: "error",
      }),
    );
  }
}

export function* handleAddInventoryTranscations(
  action: PayloadAction<InventoryTranscationsPayload>,
): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestInventoryTranscationsAdd, action.payload);
    const reports = res.data;

    yield put(
      updateInventoryTranscations({
        id: reports.id,
        type: "new",
        data: reports,
      }),
    );
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to add record",
        type: "error",
      }),
    );
  }
}

export function* handleGenerateInvoice(
  action: PayloadAction<{
    store_id: number;
    from_date: string;
    to_date: string;
  }>,
): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestGenerateInvoice, action.payload);
    setToast({
      message: "Invoice has been generated",
      type: "success",
    });
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to load reports",
        type: "error",
      }),
    );
  }
}

export function* handleFetchStripeReport(
  action: PayloadAction<FetchStripeReportPayload>,
): any {
  try {
    yield put(toggleLoader(true));

    const res = yield call(requestStripeReport, action.payload);
    const reports = res.data;

    yield put(setStripeReport(reports));
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(toggleLoader(false));

    yield put(
      setToast({
        message:
          error.response?.data?.message || "Failed to load stripe reports",
        type: "error",
      }),
    );
  }
}
