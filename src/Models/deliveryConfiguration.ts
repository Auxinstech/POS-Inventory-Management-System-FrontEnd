export interface DeliveryConfiguration {
  store_id: number;
  code: string;
  status: string;
  min_order: number;
  charges: number;
  driver_fee: number;
  free_delivery_amount: number;
  distance_limit: boolean;
  id: number;
}
