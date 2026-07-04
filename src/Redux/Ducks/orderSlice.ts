import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clear } from "console";
import { produce } from "immer";
import { DeliveryConfiguration } from "Models/deliveryConfiguration";
import { Booking, CartItem } from "./homeSlice";

export interface Order {
  id: number;
  store_id: number;
  order_number: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  door_no: string | null;
  street: string;
  city: string;
  post_code: string;
  amount: string;
  total: string;
  payment_method: string;
  payment_status: string;
  comment: string | null;
  order_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  items: OrderItem[];
  store: OrderStore;
  daily_sequence: number;
  service_charges: string;
  delivery_charges: string;
  created_by: string;
  discount: string;
  source: string;
  rider_id: number | null;
  rider: OrderRider;
  is_refund: number;
}

export interface OrderRider {
  id: number;
  name: string;
  phone_number: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;
  name: string;
  price: string;
  quantity: number;
  amount: string;
  comment: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  modifiers: OrderModifier[];
}

export interface OrderModifier {
  id: number;
  order_item_id: number;
  modifier_id: number;
  name: string;
  price: string;
  vat_percent: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface OrderStore {
  id: number;
  name: string;
  slug: string;
  address: string;
  postal_code: string;
  url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ISetting {
  // orders
  orders_loaded_by_id: boolean;
  orders_by_id: Order[];

  // orders report
  orders_report_loaded: boolean;
  orders_report: Order[];

  // bookings
  orders: Order[];
  orders_loaded: boolean;

  active_order: Order | null;
  active_order_reports: Order | null;
  active_order_refund: Order | null;
  is_order_detail_open: boolean;
  printUrl: string | null;

  EditOrderItem: Booking;
  EditOrderItemID: number | null;
}

const InitialState: ISetting = {
  orders_loaded: false,
  orders_loaded_by_id: false,
  orders_report_loaded: false,
  orders_report: [],
  orders: [],
  orders_by_id: [],
  active_order: null,
  active_order_reports: null,
  active_order_refund: null,
  is_order_detail_open: false,
  printUrl: null,
  EditOrderItem: {
    header: {
      phone_number: "",
      first_name: "",
      last_name: "",
      post_code: "",
      door_no: "",
      street: "",
      city: "",
      payment_method: "Cash",
      amount: 0,
      total: 0,
      service_charges: 0,
      delivery_charges: 0,
      store_id: 0,
      comment: "",
      order_type: "Delivery",
      source: "pos",
      discount: 0,
    },
    items: [],
  },
  EditOrderItemID: null,
};

const OrderSlice = createSlice({
  name: "orders",
  initialState: InitialState,
  reducers: {
    getOrders(
      state,
      action: PayloadAction<{ store_id: number; day: string }>
    ) {},
    setOrders(state, action: PayloadAction<Order[]>) {
      return produce(state, (draftState) => {
        draftState.orders_loaded = true;
        draftState.orders = action.payload;
      });
    },
    getOrdersReport(
      state,
      action: PayloadAction<{ store_id: number; day: string }>
    ) {},
    setOrdersReport(state, action: PayloadAction<Order[]>) {
      return produce(state, (draftState) => {
        draftState.orders_report_loaded = true;
        draftState.orders_report = action.payload;
      });
    },
    removeOrder: {
      reducer: (
        state,
        action: PayloadAction<
          number,
          string,
          { onSuccess?: () => void } | undefined
        >
      ) => {
        // No state mutation here
      },
      prepare: (payload: number, meta?: { onSuccess?: () => void }) => ({
        payload,
        meta,
      }),
    },

    // Action to actually remove order from state
    setRemoveOrder: (state, action: PayloadAction<number>) => {
      return produce(state, (draftState) => {
        const index = draftState.orders.findIndex(
          (order) => order.id === action.payload
        );
        if (index !== -1) {
          draftState.orders.splice(index, 1);
        }
      });
    },
    getOrdersByID(state, action: PayloadAction<any>) {},
    setOrdersById(state, action: PayloadAction<Order[]>) {
      return produce(state, (draftState) => {
        draftState.orders_loaded_by_id = true;
        draftState.orders_by_id = action.payload;
      });
    },

    setActiveOrder(state, action: PayloadAction<Order>) {
      return produce(state, (draftState) => {
        draftState.active_order = action.payload;
      });
    },
    setActiveOrderReports(state, action: PayloadAction<Order>) {
      return produce(state, (draftState) => {
        draftState.active_order_reports = action.payload;
      });
    },
    clearActiveOrder(state) {
      return produce(state, (draftState) => {
        draftState.active_order = null;
      });
    },
    setActiveOrderRefund(state, action: PayloadAction<Order>) {
      return produce(state, (draftState) => {
        draftState.active_order_refund = action.payload;
      });
    },
    clearActiveOrderRefund(state) {
      return produce(state, (draftState) => {
        draftState.active_order_refund = null;
      });
    },
    clearActiveOrderReports(state) {
      return produce(state, (draftState) => {
        draftState.active_order_reports = null;
      });
    },
    updateOrderStatus(state, action: PayloadAction<string>) {
      return produce(state, (draftState) => {
        if (action.payload === "Refunded") {
          if (draftState.active_order_refund) {
            const idx = draftState.orders_by_id.findIndex(
              (x) => x.id == (draftState.active_order_refund as any).id
            );
            if (idx != -1) {
              draftState.orders_by_id[idx].is_refund = 1;
              draftState.active_order_refund.is_refund = 1;
              draftState.active_order_refund.status = action.payload;
              draftState.active_order_refund.payment_status = action.payload;
            }
          }
        } else {
          if (draftState.active_order) {
            const idx = draftState.orders.findIndex(
              (x) => x.id == (draftState.active_order as any).id
            );
            if (idx != -1) {
              draftState.orders[idx].status = action.payload;
              draftState.active_order.status = action.payload;

              draftState.active_order.payment_status =
                action.payload === "Completed" ? "Paid" : "Not Paid";
              // if (draftState.active_order.status === "Rejected") {
              //   draftState.active_order = null;
              // }
            }
          }
        }
      });
    },
    editOrder(state, action: PayloadAction<Order>) {
      return produce(state, (draftState) => {
        state.EditOrderItemID = action.payload.id;

        // Items
        let items: CartItem[] = action.payload.items.map((item: any) => ({
          id: Number(item.id),
          name: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price),
          amount: Number(item.amount),
          comment: item.comment ?? "",
          modifiers:
            item.modifiers?.map((modifier: any) => ({
              id: Number(modifier.modifier_id ?? modifier.id),
              name: modifier.name,
              price: Number(modifier.price),
            })) || [],
        }));

        // Header
        state.EditOrderItem.header = {
          phone_number: action.payload.phone_number,
          first_name: action.payload.first_name,
          last_name: action.payload.last_name,
          post_code: action.payload.post_code,
          door_no: action.payload.door_no || "",
          street: action.payload.street,
          city: action.payload.city,
          payment_method: action.payload.payment_method,
          amount: Number(action.payload.amount) || 0,
          total: Number(action.payload.total) || 0,
          service_charges: Number(action.payload.service_charges) || 0,
          delivery_charges: Number(action.payload.delivery_charges) || 0,
          discount: Number(action.payload.discount) || 0,
          store_id: action.payload.store_id,
          comment: action.payload.comment || "",
          order_type: action.payload.order_type,
          source: action.payload.source,
        };

        // Assign items array properly

        state.EditOrderItem.items = items;
      });
    },
    removeEditOrder(state) {
      state.EditOrderItemID = null;
      state.EditOrderItem.header = {
        phone_number: "",
        first_name: "",
        last_name: "",
        post_code: "",
        door_no: "",
        street: "",
        city: "",
        payment_method: "Cash",
        amount: 0,
        total: 0,
        service_charges: 0,
        delivery_charges: 0,
        store_id: 0,
        comment: "",
        order_type: "Delivery",
        source: "pos",
        discount: 0,
      };
      state.EditOrderItem.items = [];
    },
    assignRider(state, action: PayloadAction<number | null>) {
      return produce(state, (draftState) => {
        if (draftState.active_order) {
          const idx = draftState.orders.findIndex(
            (x) => x.id == (draftState.active_order as any).id
          );
          if (idx != -1) {
            draftState.orders[idx].rider_id = action.payload;
            if (action.payload === null) {
              draftState.orders[idx].status = "Ready";
            } else {
              draftState.orders[idx].status = "Assigned";
            }
          }
        }
      });
    },
    toggleOrderDetail(state) {
      return produce(state, (draftState) => {
        draftState.is_order_detail_open = !draftState.is_order_detail_open;
      });
    },
    printOrder(state, action: PayloadAction<number>) {
      // No state changes needed
    },
    setPrintUrl: (state, action: PayloadAction<string>) => {
      state.printUrl = action.payload;
    },
    clearPrintUrl: (state) => {
      state.printUrl = null;
    },
  },
});

export const {
  getOrders,
  setOrders,
  removeOrder,
  setRemoveOrder,
  getOrdersByID,
  setOrdersById,
  setActiveOrder,
  updateOrderStatus,
  toggleOrderDetail,
  printOrder,
  setPrintUrl,
  clearPrintUrl,
  clearActiveOrder,
  assignRider,
  getOrdersReport,
  setOrdersReport,
  setActiveOrderReports,
  editOrder,
  removeEditOrder,
  setActiveOrderRefund,
  clearActiveOrderReports,
  clearActiveOrderRefund,
} = OrderSlice.actions;

export default OrderSlice.reducer;
