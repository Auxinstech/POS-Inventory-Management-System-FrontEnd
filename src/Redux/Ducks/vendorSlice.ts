// Slice file (e.g., vendorSlice.ts)
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IVendor {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  type: "retail" | "wholesale" | "corporate";
  credit_limit: number;
  balance: number;
  status: boolean;
  created_at?: string;
  updated_at?: string;
  store_id?: number;
}

export interface IVendorCreatePayload {
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  type: "retail" | "wholesale" | "corporate";
  credit_limit: number;
  balance?: number;
  status?: boolean;
  store_id?: number;
}

export interface IVendorsListParams {
  search?: string;
  paginate?: number;
  per_page?: number;
  sort_by?: string;
  sort?: "asc" | "desc";
  store_id?: number;
  page?: number;
}

interface VendorsState {
  vendors: IVendor[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const initialState: VendorsState = {
  vendors: [],
  pagination: undefined,
};

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    fetchVendorList(
      state,
      action: PayloadAction<IVendorsListParams | undefined>,
    ) {},
    setVendorList(
      state,
      action: PayloadAction<{
        data: IVendor[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      }>,
    ) {
      state.vendors = action.payload.data;
      state.pagination = {
        current_page: action.payload.current_page,
        last_page: action.payload.last_page,
        per_page: action.payload.per_page,
        total: action.payload.total,
      };
    },
    createVendor: {
      reducer(
        state,
        action: PayloadAction<
          IVendorCreatePayload,
          string,
          { onSuccess?: () => void }
        >,
      ) {
        // No reducer logic; saga handles it
      },
      prepare(
        data: IVendorCreatePayload,
        meta: { onSuccess?: () => void } = {},
      ) {
        return { payload: data, meta };
      },
    },
    deleteVendor: {
      reducer: (
        state,
        action: PayloadAction<
          number,
          string,
          { onSuccess?: () => void } | undefined
        >,
      ) => {
        state.vendors = state.vendors.filter(
          (vendor) => vendor.id !== action.payload,
        );
      },
      prepare: (id: number, meta?: { onSuccess?: () => void }) => ({
        payload: id,
        meta,
      }),
    },
    updateVendor: {
      reducer: (
        state,
        action: PayloadAction<
          { id: number; data: Partial<IVendorCreatePayload> },
          string,
          { onSuccess?: (resData: any) => void } | undefined
        >,
      ) => {
        const { id, data } = action.payload;
        const index = state.vendors.findIndex((vendor) => vendor.id === id);
        if (index !== -1) {
          state.vendors[index] = {
            ...state.vendors[index],
            ...data,
            updated_at: new Date().toISOString(),
          };
        }
      },
      prepare: (
        payload: { id: number; data: Partial<IVendorCreatePayload> },
        meta?: { onSuccess?: (resData: any) => void },
      ) => ({
        payload,
        meta,
      }),
    },
    addVendor(state, action: PayloadAction<IVendor>) {
      state.vendors.push(action.payload);
    },
  },
});

export const {
  fetchVendorList,
  setVendorList,
  createVendor,
  addVendor,
  deleteVendor,
  updateVendor,
} = vendorSlice.actions;

export default vendorSlice.reducer;
export { initialState };
