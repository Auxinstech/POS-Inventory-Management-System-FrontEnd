import { useAppDispatch, useAppSelector } from "Hook/hooks";
import React, { useEffect } from "react";
import { fetchInvoiceSummary } from "../../Redux/Ducks/reportSlice";
import StoreInvoiceSummaryGrid from "Components/StoreInvoiceSummarGrid";

export default function InvoiceSummary({
  store_id,
  setActiveMenu,
}: {
  store_id: number;
  setActiveMenu: (menu: string) => void;
}) {
  const dispatch = useAppDispatch();

  const invoiceSummary = useAppSelector((state) => state.report.invoiceSummary);

  useEffect(() => {
    if (store_id) {
      const today = new Date().toISOString().split("T")[0];

      dispatch(
        fetchInvoiceSummary({
          store_id,
          from_date: "",
          to_date: "",
          per_page: 15,
          page: 1,
          status: "",
          sort_by: "id",
          sort_order: "desc",
        })
      );
    }
  }, [store_id, dispatch]);

  return (
    <div className="manage-wrapper">
      <div className="manage-container">
        <div className="p-2">
          <StoreInvoiceSummaryGrid
            orders={invoiceSummary}
            store_id={store_id}
          />
        </div>
      </div>
    </div>
  );
}
