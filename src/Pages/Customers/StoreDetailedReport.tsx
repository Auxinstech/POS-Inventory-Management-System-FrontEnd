import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ManageMenu from "./ManageMenu";
import { useAppSelector } from "Hook/hooks";
import CustomerMaster from "./CustomerMaster";

function StoreDetailedReport() {
  const [activeMenu, setActiveMenu] = useState<string>("customer-master");
  const active_store = useAppSelector((state) => state.Home.selected_store);

  return (
    <div className="d-flex">
      <ManageMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="manage-wrapper flex-grow-1">
        {activeMenu === "customer-master" ? (
          <CustomerMaster store_id={active_store || 0} />
        ) : null}
      </div>
    </div>
  );
}

export default StoreDetailedReport;
