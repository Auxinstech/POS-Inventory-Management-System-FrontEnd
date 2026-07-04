import { useAppDispatch, useAppSelector } from "Hook/hooks";
import React, { useEffect, useState } from "react";
import StoreDiscountsGrid from "Components/StoreDiscountsGrid";
import { fetchDiscountList } from "../../Redux/Ducks/homeSlice";

export default function Discounts() {
  const dispatch = useAppDispatch();
  const store_id = useAppSelector((state) => state.Home.selected_store);

  const discounts = useAppSelector((state) => state.Home.discounts);
  const pagination = useAppSelector((state) => state.Home.discount_pagination);
  console.log(discounts);

  useEffect(() => {
    if (store_id) {
      dispatch(
        fetchDiscountList({
          store_id: store_id,
          paginate: 1,
          per_page: 10,
          page: 1,
          sort_by: "id",
          sort: "desc",
        }),
      );
    }
  }, [store_id, dispatch]);

  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="p-2">
          <StoreDiscountsGrid
            data={discounts || []}
            store_id={store_id ?? 0}
            pagination={pagination}
          />
        </div>
      </div>
    </div>
  );
}
