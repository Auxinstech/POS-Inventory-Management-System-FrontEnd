import { useAppDispatch, useAppSelector } from "Hook/hooks";
import React, { useEffect, useState } from "react";
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import { fetchCustomerList } from "../../Redux/Ducks/customerSlice";
import StoreCustomerMasterGrid from "Components/StoreCustomerMasterGrid";

export default function CustomerMaster({ store_id }: { store_id: number }) {
  const dispatch = useAppDispatch();

  const customers = useAppSelector((state) => state.customer);
  console.log(customers);

  useEffect(() => {
    if (store_id) {
      dispatch(
        fetchCustomerList({
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
          <StoreCustomerMasterGrid
            data={customers?.customers || []}
            store_id={store_id}
            pagination={customers?.pagination}
          />
        </div>
      </div>
    </div>
  );
}
