import {
  FetchDetailedReportPayload,
  FetchReportPayload,
  FetchStripeReportPayload,
  InventoryTranscationsPayload,
} from "../../../Redux/Ducks/reportSlice";
import { get, post, remove, put } from "../../../Utils/axios";

export const requestReportsList = (params?: FetchReportPayload) => {
  return get("/report-summary", { params });
};

export const requestInvoiceSummaryList = (params?: FetchReportPayload) => {
  return get("/invoices", { params });
};

export const requestDetailedReport = (params?: FetchDetailedReportPayload) => {
  return get("/detailed-report", { params });
};

export const requestStripeReport = (params?: FetchStripeReportPayload) => {
  return get("/orders/payments-log", { params });
};

export const requestGenerateInvoice = (data: any) => {
  return post("/invoices", data);
};

export const requestMarkInvoicePaid = (payload: {
  store_id: number;
  invoice_id: number;
}) => {
  return post("/invoices/mark-as-paid", payload);
};

export const requestInventoryTranscations = (store_id: number) => {
  return get(`/inventory-transactions?store_id=${store_id}`);
};

export const requestInventoryTranscationsAdd = (
  payload: InventoryTranscationsPayload,
) => {
  return post("/inventory-transactions", payload);
};

export const requestInventoryTranscationsDelete = (id: number) => {
  return remove(`/inventory-transactions/${id}`);
};
