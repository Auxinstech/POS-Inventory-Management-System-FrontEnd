import { DeliveryConfiguration } from "Models/deliveryConfiguration";
import { get, post, put, remove } from "Utils/axios";

export function requestGetOrdersByID(data: any): any {
  if (data.fetchAll) {
    return get(`bookings?store_id=${data.store_id}`);
  } else
    return get(
      `bookings?store_id=${data.store_id}&from_date=${data.from_date}&to_date=${data.to_date}`
    );
}

export function requestGetOrders(id: number, date: string): any {
  return get(`/orders/today?store_id=${id}&filter_by=${date}`);
}

export function requestGetReportOrders(id: number, date: string): any {
  return get(`/orders/history?store_id=${id}&filter_by=${date}`);
}

export function requestRemoveOrder(id: number): any {
  return remove(`bookings/${id}`);
}

export function requestUpdateOrderStatus(id: number, model: any): any {
  return put(`bookings/${id}`, model);
}

export function requestAssignRider(id: number, model: any): any {
  return put(`bookings/${id}`, model);
}

export function requestPrintOrder(id: number): any {
  return post(`bookings/generate-pdf/${id}`);
}
