import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Item } from "Models/item";

// --- Store info ---
export interface StoreInfo {
  id: number;
  name: string;
  slug: string;
  address?: string;
  postal_code?: string;
  url?: string | null;
  status?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

// --- Report entry ---
export interface ReportEntry {
  total: number;
  orders_count: number;
  service_charges: number;
  store_id: number;
  store: StoreInfo;
}

// --- Invoice summary entry ---
export interface InvoiceSummaryEntry {
  id: number;
  status: string;
  store_id: number;
  num_of_orders: number;
  amount: string;
  from_date: string;
  to_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  store: StoreInfo;
}

// --- Pagination / links ---
export interface InvoiceSummaryLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

// --- Full API response with pagination ---
export interface InvoiceSummaryResponse<T = InvoiceSummaryEntry> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: InvoiceSummaryLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

// --- Payload for fetching invoice summary ---
export interface InvoiceSummaryPayload {
  store_id: number;
  from_date: string;
  to_date: string;
  per_page: number;
  page: number;
  status: string;
  sort_by: string;
  sort_order: string;
}

// --- Payload for fetching reports ---
export interface FetchReportPayload {
  from_date?: string;
  to_date?: string;
}

export interface FetchDetailedReportPayload {
  from_date?: string;
  to_date?: string;
  store_id?: number;

  group_by?: string;

  payment_method?: string;
}

export interface FetchStripeReportPayload {
  from_date: string;
  to_date: string;
  store_id: number;
  page: number;
  per_page: number;
  paginate: number;
}

export interface InventoryTranscationsPayload {
  store_id: number;
  item_id: number;
  quantity: number;
}

// --- Redux state ---
interface ReportState {
  reports: ReportEntry[];
  invoiceSummary: InvoiceSummaryResponse | null; // store full API response including pagination
  detailed_reports: any; // TODO: type this

  inventoryTranscations: any; // TODO: type this
  stripeReport: any; // TODO: type this
}

const initialState: ReportState = {
  reports: [],
  invoiceSummary: null,
  detailed_reports: {},
  inventoryTranscations: null,
  stripeReport: null,
};

// --- Slice ---
const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    // Async fetch triggers (thunks/sagas can listen to these)
    fetchReports(state, _action: PayloadAction<FetchReportPayload>) {},
    fetchInvoiceSummary(
      state,
      _action: PayloadAction<InvoiceSummaryPayload>,
    ) {},

    // Setters for data after fetch
    setReportsList(state, action: PayloadAction<ReportEntry[]>) {
      state.reports = action.payload;
    },
    setInvoiceSummaryList(
      state,
      action: PayloadAction<InvoiceSummaryResponse>,
    ) {
      state.invoiceSummary = action.payload;
    },
    setMarkasPaid(
      state,
      action: PayloadAction<{
        store_id: number;
        invoice_id: number;
      }>,
    ) {},
    setGenerateInvoice(
      state,
      action: PayloadAction<{
        store_id: number;
        from_date: string;
        to_date: string;
      }>,
    ) {},
    fetchDetailedReport(
      state,
      _action: PayloadAction<FetchDetailedReportPayload>,
    ) {},
    setDetailedReport(state, action: PayloadAction<any>) {
      state.detailed_reports = action.payload;
    },
    fetchInventoryTranscations(state, action: PayloadAction<any>) {},
    setInventoryTranscations(state, action: PayloadAction<any>) {
      state.inventoryTranscations = action.payload;
    },
    deleteInventoryTranscations(state, action: PayloadAction<any>) {},
    addInventoryTranscations(
      state,
      action: PayloadAction<InventoryTranscationsPayload>,
    ) {},
    updateInventoryTranscations(
      state,
      action: PayloadAction<{
        id: number;
        type: "new" | "delete";
        data: any;
      }>,
    ) {
      const { id, type, data } = action.payload;

      if (type === "new") {
        state.inventoryTranscations.push(data as Item);
      } else {
        const existingIndex = state.inventoryTranscations.findIndex(
          (item: any) => item.id === id,
        );

        if (existingIndex !== -1) {
          // Remove the existing item
          const deletedItem = state.inventoryTranscations.splice(
            existingIndex,
            1,
          )[0];
          console.log("Item deleted:", deletedItem);
        } else {
          // Add the new item if it doesn't exist
          state.inventoryTranscations.push(data as Item);
          console.log("Item added:", data);
        }
      }
    },
    fetchStripeReport(
      state,
      _action: PayloadAction<FetchStripeReportPayload>,
    ) {},
    setStripeReport(state, action: PayloadAction<any>) {
      state.stripeReport = action.payload;
    },
  },
});

export const {
  fetchReports,
  setReportsList,
  fetchInvoiceSummary,
  setInvoiceSummaryList,
  setMarkasPaid,
  setGenerateInvoice,
  fetchDetailedReport,
  setDetailedReport,
  fetchInventoryTranscations,
  setInventoryTranscations,
  deleteInventoryTranscations,
  addInventoryTranscations,
  updateInventoryTranscations,
  fetchStripeReport,
  setStripeReport,
} = reportSlice.actions;

export default reportSlice.reducer;
export { initialState };
