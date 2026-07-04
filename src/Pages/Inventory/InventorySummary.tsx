import StoreInventorySummaryGrid from "Components/StoreInventorySummaryGrid";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { Item } from "Models/item";
import React, { useEffect, useState } from "react";
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import { requestGetItems } from "../../Redux/Sagas/Requests/home";
import { fetchInventoryTranscations } from "../../Redux/Ducks/reportSlice";

export default function InventorySummary({ store_id }: { store_id: number }) {
  const dispatch = useAppDispatch();

  const inventoryTranscations = useAppSelector(
    (state) => state.report.inventoryTranscations
  );

  useEffect(() => {
    if (store_id) {
      dispatch(fetchInventoryTranscations(store_id));
    }
  }, [store_id]);

  const [items, setItems] = useState<Item[]>([]);

  const getItems = async () => {
    dispatch(toggleLoader(true));
    const res = await requestGetItems(store_id);
    setItems(res.data);
    dispatch(toggleLoader(false));
  };

  useEffect(() => {
    if (store_id) {
      getItems();
    }
  }, [store_id]);

  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="p-2">
          <StoreInventorySummaryGrid
            items={items}
            data={inventoryTranscations || []}
            store_id={store_id}
          />
        </div>
      </div>
    </div>
  );
}
