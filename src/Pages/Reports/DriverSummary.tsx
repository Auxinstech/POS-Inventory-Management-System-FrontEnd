import { useAppDispatch, useAppSelector } from "Hook/hooks";
import React, { useEffect, useState } from "react";
import { getOrders, getOrdersByID } from "../../Redux/Ducks/orderSlice";
import StoreDriverSummaryGrid from "Components/StoreDriverSummaryGrid";

export default function DriverSummary({
  store_id,
  setActiveMenu,
}: {
  store_id: number;
  setActiveMenu: (menu: string) => void;
}) {
  const dispatch = useAppDispatch();
  const orders_loaded = useAppSelector((state) => state.Order.orders_loaded);
  const all_orders = useAppSelector((state) => state.Order.orders_by_id);

  useEffect(() => {
    if (store_id) {
      dispatch(
        getOrdersByID({
          store_id: store_id,
          from_date: new Date().toISOString().split("T")[0],
          to_date: new Date().toISOString().split("T")[0],
        })
      );
    }
  }, [store_id]);

  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="p-2">
          <StoreDriverSummaryGrid
            orders={all_orders}
            store_id={store_id}
            setActiveMenu={setActiveMenu}
          />
        </div>
      </div>
    </div>
  );
}
