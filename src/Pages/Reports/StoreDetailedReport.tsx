import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ManageMenu from "./ManageMenu";
import OrdersSummary from "./OrdersSummary";
import DriverSummary from "./DriverSummary";
import OrdersReport from "./Orders-Report";
import InventoryReport from "./InventoryReport";
import DetailedReport from "./DetailedReport";
import StripeReport from "./StripeReport";
import SalesSummary from "./SalesSummary";

function StoreDetailedReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storeIdParam = searchParams.get("store_id");
  const storeIdNum = storeIdParam ? Number(storeIdParam) : NaN;
  const [activeMenu, setActiveMenu] = useState<string>("sales-summary");

  // Redirect to /reports if no valid store_id
  useEffect(() => {
    if (!storeIdParam || isNaN(storeIdNum) || storeIdNum <= 0) {
      navigate("/reports", { replace: true });
    }
  }, [storeIdParam, storeIdNum, navigate]);

  if (!storeIdParam || isNaN(storeIdNum) || storeIdNum <= 0) return null;

  return (
    <div className="d-flex">
      <ManageMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="manage-wrapper flex-grow-1">
        {activeMenu === "orders-summary" ? (
          <OrdersSummary store_id={storeIdNum} setActiveMenu={setActiveMenu} />
        ) : activeMenu === "driver-summary" ? (
          <DriverSummary store_id={storeIdNum} setActiveMenu={setActiveMenu} />
        ) : activeMenu === "orders-report" ? (
          <OrdersReport />
        ) : activeMenu === "inventory-report" ? (
          <InventoryReport
            store_id={storeIdNum}
            setActiveMenu={setActiveMenu}
          />
        ) : activeMenu === "detailed-report" ? (
          <DetailedReport store_id={storeIdNum} setActiveMenu={setActiveMenu} />
        ) : activeMenu === "stripe-report" ? (
          <StripeReport store_id={storeIdNum} setActiveMenu={setActiveMenu} />
        ) : activeMenu === "sales-summary" ? (
          <SalesSummary store_id={storeIdNum} setActiveMenu={setActiveMenu} />
        ) : null}
      </div>
    </div>
  );
}

export default StoreDetailedReport;
