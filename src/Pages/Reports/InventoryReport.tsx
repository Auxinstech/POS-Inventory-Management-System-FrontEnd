import StoreOrderSummaryGrid from "Components/StoreOrderSummaryGrid";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import React, { useEffect, useState } from "react";
import { getOrders, getOrdersByID } from "../../Redux/Ducks/orderSlice";
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import { requestGetItems } from "../../Redux/Sagas/Requests/home";
import { Item } from "Models/item";
import StoreInventoryReportGrid from "Components/StoreInventoryReportGrid";

export default function InventoryReport({
  store_id,
  setActiveMenu,
}: {
  store_id: number;
  setActiveMenu: (menu: string) => void;
}) {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<Item[]>([]);

  const getItems = async () => {
    dispatch(toggleLoader(true));
    const res = await requestGetItems(store_id);
    setItems(res.data);
    dispatch(toggleLoader(false));
  };

  useEffect(() => {
    if (!(items.length >= 1)) {
      getItems();
    }
  }, []);

  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="p-2">
          <StoreInventoryReportGrid items={items} />
        </div>
      </div>
    </div>
  );
}
