import { useAppDispatch, useAppSelector } from "Hook/hooks";
import React, { useEffect, useState } from "react";
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import StoreVendorMasterGrid from "Components/StoreVendorMasterGrid";
import { fetchVendorList } from "../../Redux/Ducks/vendorSlice";

export default function VendorMaster({ store_id }: { store_id: number }) {
  const dispatch = useAppDispatch();

  const vendor = useAppSelector((state) => state.vendor);
  console.log(vendor);

  useEffect(() => {
    if (store_id) {
      dispatch(
        fetchVendorList({
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
          <StoreVendorMasterGrid
            data={vendor?.vendors || []}
            store_id={store_id}
            pagination={vendor?.pagination}
          />
        </div>
      </div>
    </div>
  );
}
