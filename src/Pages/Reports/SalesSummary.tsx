import StoreSalesSummary from "Components/StoreSalesSummary";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import React, { useEffect, useState } from "react";
import { getOrders, getOrdersByID } from "../../Redux/Ducks/orderSlice";

export default function SalesSummary({
  store_id,
  setActiveMenu,
}: {
  store_id: number;
  setActiveMenu: (menu: string) => void;
}) {
  const dispatch = useAppDispatch();
  const all_orders = useAppSelector((state) => state.Order.orders_by_id);

  useEffect(() => {
    if (store_id) {
      dispatch(
        getOrdersByID({
          store_id: store_id,
          from_date: new Date().toISOString().split("T")[0],
          to_date: new Date().toISOString().split("T")[0],
        }),
      );
    }
  }, [store_id]);

  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="p-2">
          <StoreSalesSummary
            orders={all_orders}
            store_id={store_id}
            setActiveMenu={setActiveMenu}
          />
        </div>
      </div>
    </div>
  );
}
