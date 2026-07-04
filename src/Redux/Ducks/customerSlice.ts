import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ICustomer {
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

export interface ICustomerCreatePayload {
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

export interface ICustomersListParams {
  search?: string;
  paginate?: number;
  per_page?: number;
  sort_by?: string;
  sort?: "asc" | "desc";
  store_id?: number;
  page?: number;
}

interface CustomersState {
  customers: ICustomer[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const initialState: CustomersState = {
  customers: [],
  pagination: undefined,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    fetchCustomerList(
      state,
      action: PayloadAction<ICustomersListParams | undefined>,
    ) {},
    setCustomerList(
      state,
      action: PayloadAction<{
        data: ICustomer[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      }>,
    ) {
      state.customers = action.payload.data;
      state.pagination = {
        current_page: action.payload.current_page,
        last_page: action.payload.last_page,
        per_page: action.payload.per_page,
        total: action.payload.total,
      };
    },
    createCustomer: {
      reducer(
        state,
        action: PayloadAction<
          ICustomerCreatePayload,
          string,
          { onSuccess?: () => void }
        >,
      ) {
        // No reducer logic; saga handles it
      },
      prepare(
        data: ICustomerCreatePayload,
        meta: { onSuccess?: () => void } = {},
      ) {
        return { payload: data, meta };
      },
    },
    // CustomersSlice.ts
    deleteCustomer: {
      reducer: (
        state,
        action: PayloadAction<
          number,
          string,
          { onSuccess?: () => void } | undefined
        >,
      ) => {
        state.customers = state.customers.filter(
          (customer) => customer.id !== action.payload,
        );
      },
      prepare: (id: number, meta?: { onSuccess?: () => void }) => ({
        payload: id,
        meta,
      }),
    },
    updateCustomer: {
      reducer: (
        state,
        action: PayloadAction<
          { id: number; data: Partial<ICustomerCreatePayload> },
          string,
          { onSuccess?: (resData: any) => void } | undefined
        >,
      ) => {
        const { id, data } = action.payload;
        const index = state.customers.findIndex(
          (customer) => customer.id === id,
        );
        if (index !== -1) {
          state.customers[index] = {
            ...state.customers[index],
            ...data,
            updated_at: new Date().toISOString(),
          };
        }
      },
      prepare: (
        payload: { id: number; data: Partial<ICustomerCreatePayload> },
        meta?: { onSuccess?: (resData: any) => void },
      ) => ({
        payload,
        meta,
      }),
    },
    addCustomer(state, action: PayloadAction<ICustomer>) {
      state.customers.push(action.payload);
    },
  },
});

export const {
  fetchCustomerList,
  setCustomerList,
  createCustomer,
  addCustomer,
  deleteCustomer,
  updateCustomer,
} = customerSlice.actions;

export default customerSlice.reducer;
export { initialState };
