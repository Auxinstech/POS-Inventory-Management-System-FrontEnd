import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ManageMenu from "./ManageMenu";
import InvoiceSummary from "./InvoiceSummary";
import { useAppSelector } from "Hook/hooks";
import GenerateInvoice from "./GnerateInvoice";
import Refund from "./Refund";

function StoreDetailedReport() {
  const [activeMenu, setActiveMenu] = useState<string>("invoice-summary");
  const active_store = useAppSelector((state) => state.Home.selected_store);

  return (
    <div className="d-flex">
      <ManageMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="manage-wrapper flex-grow-1">
        {activeMenu === "invoice-summary" ? (
          <InvoiceSummary store_id={active_store || 0} />
        ) : activeMenu === "generate-invoice" ? (
          <GenerateInvoice store_id={active_store || 0} />
        ) : activeMenu === "refund" ? (
          <Refund store_id={active_store || 0} />
        ) : null}
      </div>
    </div>
  );
}

export default StoreDetailedReport;
